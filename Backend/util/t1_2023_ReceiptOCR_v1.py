# -*- coding: utf-8 -*-
"""
Created on Sat Apr  1 11:47:12 2023

@author: User
"""

import os

import numpy as np
import pandas as pd
import difflib
import cv2
import matplotlib.pyplot as plt

from skimage.filters import threshold_local
from PIL import Image

import re
import cv2
import pytesseract
import numpy as np
import matplotlib.pyplot as plt

from skimage.filters import threshold_local
from PIL import Image
from pytesseract import Output
from prettytable import PrettyTable

import sys

import mysql.connector
import pymysql
from sqlalchemy import create_engine
from datetime import datetime

def opencv_resize(image, ratio):
    width = int(image.shape[1] * ratio)
    height = int(image.shape[0] * ratio)
    dim = (width, height)
    return cv2.resize(image, dim, interpolation = cv2.INTER_AREA)

def plot_rgb(image):
    plt.figure(figsize=(16,10))
    return plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

def plot_gray(image):
    plt.figure(figsize=(16,10))
    return plt.imshow(image, cmap='Greys_r')

# approximate the contour by a more primitive polygon shape
def approximate_contour(contour):
    peri = cv2.arcLength(contour, True)
    return cv2.approxPolyDP(contour, 0.032 * peri, True)

def get_receipt_contour(contours):    
    # loop over the contours
    for c in contours:
        approx = approximate_contour(c)
        # if our approximated contour has four points, we can assume it is receipt's rectangle
        if len(approx) == 4:
            return approx

def contour_to_rect(contour):
    pts = contour.reshape(4, 2)
    rect = np.zeros((4, 2), dtype = "float32")
    # top-left point has the smallest sum
    # bottom-right has the largest sum
    s = pts.sum(axis = 1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    # compute the difference between the points:
    # the top-right will have the minumum difference 
    # the bottom-left will have the maximum difference
    diff = np.diff(pts, axis = 1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect / resize_ratio

def wrap_perspective(img, rect):
    # unpack rectangle points: top left, top right, bottom right, bottom left
    (tl, tr, br, bl) = rect
    # compute the width of the new image
    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    # compute the height of the new image
    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    # take the maximum of the width and height values to reach
    # our final dimensions
    maxWidth = max(int(widthA), int(widthB))
    maxHeight = max(int(heightA), int(heightB))
    # destination points which will be used to map the screen to a "scanned" view
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype = "float32")
    # calculate the perspective transform matrix
    M = cv2.getPerspectiveTransform(rect, dst)
    # warp the perspective to grab the screen
    return cv2.warpPerspective(img, M, (maxWidth, maxHeight))

def grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

#Remove Noise from an image
def noise_removal(image):
    import numpy as np
    kernel = np.ones((1, 1), np.uint8)
    image = cv2.dilate(image, kernel, iterations=1)
    kernel = np.ones((1, 1), np.uint8)
    image = cv2.erode(image, kernel, iterations=1)
    image = cv2.morphologyEx(image, cv2.MORPH_CLOSE, kernel)
    image = cv2.medianBlur(image, 3)
    return (image)

#find amounts on a receipt
def find_amounts(text):
    amounts = re.findall(r'\d+\.\d{2}\b', text)
    floats = [float(amount) for amount in amounts]
    #find all values split with a ,
    faulty_amounts = re.findall(r'\d+\,\d{2}\b', text)
    fixed_amounts=[]
    float_amounts=[]
    for amount in faulty_amounts:
        #Substitiut , for a .
       amount=re.sub(",",".", amount)
       fixed_amounts.append(amount)
   #convert amount to a float
    for amount in fixed_amounts:
        amount=float(amount)
        float_amounts.append(amount)
    #add new list of floats to the start of the existing list
    for amount in float_amounts:
        floats.insert(0,amount)  
    return floats

def find_between( s, first, last ):
    try:
        start = s.index( first ) + len( first )
        end = s.index( last, start )
        print(s[start:end])
        return s[start:end]
    except ValueError:
        return "No match found"

def find_between_r( s, first, last ):
    try:
        start = s.rindex( first ) + len( first )
        end = s.rindex( last, start )
        return s[start:end]
    except ValueError:
        return ""
    
def find_number_of_items_woolies (text):
    #search for the number before SUBTOTAL 
    subtotal_line = r"(\d+)\s+SUBTOTAL"
    match = re.search(subtotal_line, text)
    if match:
        number_of_items = match.group(1)
        #print(number_of_items)
        return number_of_items
    else:
        print('No match found')
        
def find_number_of_items_coles (text):
    #search for the number before SUBTOTAL
    subtotal_line = r"Total for+\s(\d+)"
    match = re.search(subtotal_line, text)
    if match:
        number_of_items = match.group(1)
        return number_of_items
    else:
        print('No match found')

def sum_of_item_cost(number_of_items, item_costs):
    total =0
    while number_of_items >0:
        total=total + item_costs[number_of_items-1]
        number_of_items=number_of_items-1
    return(total)

def verify_total(total,amounts):
    verifyed_total = False
    for value in amounts:
        if total == value:
            verifyed_total = True
            return verifyed_total
        else: 
            verifyed_total = False
    return verifyed_total

def bw_scanner(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    T = threshold_local(gray, 21, offset = 5, method = "gaussian")
    return (gray > T).astype("uint8") * 255

def find_Receipt( s, last ):
    try:
        global first
        global end
        first= re.search(r'\d{2}:\d{2}', s)
        first = first.group()
        start = s.index( first ) + len( first )
        end = s.index( last, int(start) )
        return s[start:end]
    except ValueError:
        return "No match found"


# Sample file out of the dataset
PyTesLoc = 1
#FileNameLoc = sys.argv[2]
FileNameLoc="20230415_132714.jpg"
UserID = 1

#pytesseract.pytesseract.tesseract_cmd = 'Tesseract-OCR/tesseract.exe'
# Sample file out of the dataset
#file_name = '../uploads/wxwg74gj02831.jpg'
#pytesseract.pytesseract.tesseract_cmd = PyTesLoc
file_name = FileNameLoc

img = Image.open(file_name)
img.thumbnail((800,800), Image.ANTIALIAS)
img

image = cv2.imread(file_name)
# Downscale image as finding receipt contour is more efficient on a small image
resize_ratio = 500 / image.shape[0]
original = image.copy()
image = opencv_resize(image, resize_ratio)

# Convert to grayscale for further processing
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
plot_gray(gray)

# Get rid of noise with Gaussian Blur filter
blurred = cv2.GaussianBlur(gray, (5, 5), 0)
plot_gray(blurred)
cv2.imwrite("reciept_blured.jpg", blurred)
 

# Detect white regions
rectKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
dilated = cv2.dilate(blurred, rectKernel)
plot_gray(dilated)
cv2.imwrite("reciept_dilated.jpg", dilated)

#Convert to black and white
img = cv2.imread("reciept_dilated.jpg")
thresh, greyed= cv2.threshold(img,140,255, cv2.THRESH_BINARY)
cv2.imwrite("greyed.jpg", greyed)

edged = cv2.Canny(greyed, 100, 200, apertureSize=3)
plot_gray(edged)

# Detect all contours in Canny-edged image
contours, hierarchy = cv2.findContours(edged, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
image_with_contours = cv2.drawContours(image.copy(), contours, -1, (0,255,0), 3)
cv2.imwrite("image_with_contours.jpg", image_with_contours)
plot_rgb(image_with_contours)

# Get 10 largest contours
largest_contours = sorted(contours, key = cv2.contourArea, reverse = True)[:10]
image_with_largest_contours = cv2.drawContours(image.copy(), largest_contours, -1, (0,255,0), 3)
cv2.imwrite("image_with_largest_contours.jpg", image_with_largest_contours)
plot_rgb(image_with_largest_contours)


get_receipt_contour(largest_contours)

receipt_contour = get_receipt_contour(largest_contours)
image_with_receipt_contour = cv2.drawContours(image.copy(), [receipt_contour], -1, (0, 255, 0), 2)

plot_rgb(image_with_receipt_contour)
cv2.imwrite("image_with_receipt_contour.jpg", image_with_receipt_contour)

scanned = wrap_perspective(original.copy(), contour_to_rect(receipt_contour))
plt.figure(figsize=(16,10))
plt.imshow(scanned)
#scanned.save('scanned.png')
cv2.imwrite('scanned.jpg', scanned)

result = bw_scanner(scanned)
image = bw_scanner(scanned)
plot_gray(result)

output = Image.fromarray(result)
output.save('result.jpg')


##START MY EDITS

#Convert to greyscale
gray_image = grayscale(scanned)
cv2.imwrite("gray.jpg", gray_image)

#INVERT IMAGE
inverted_image = cv2.bitwise_not(gray_image)
cv2.imwrite("inverted.jpg", inverted_image)


no_noise = noise_removal(inverted_image)
cv2.imwrite("no_noise.jpg", no_noise)


#From Original Code
img=cv2.imread('no_noise.jpg')
#print(os.path.exists('result.png'))
d = pytesseract.image_to_data("no_noise.jpg", output_type=Output.DICT)
n_boxes = len(d['level'])
boxes = no_noise
for i in range(n_boxes):
    (x, y, w, h) = (d['left'][i], d['top'][i], d['width'][i], d['height'][i])
    #Added by Dane Eliminate very small boxes (noise)
    if  h> 20 and w>5:    
        boxes = cv2.rectangle(boxes, (x, y), (x + w, y + h), (0, 255, 0), 2)
cv2.imwrite("b_Box.jpg", boxes)
plot_rgb(boxes)

extracted_text = pytesseract.image_to_string(boxes)
#print(extracted_text)

#Find Supermarket
listword1 = ['woolworth', 'WOOLWORTH', 'Woolworth',"The fresh food people", 'The fresh Food pple']
listword2 = ['coles', 'COLES', 'Coles']
if any(re.search(r'\b{}\b'.format(re.escape(word)), extracted_text) for word in listword1):
    Supermarket = 'Woolworths'
elif any(re.search(r'\b{}\b'.format(re.escape(word)), extracted_text) for word in listword2):
    Supermarket = 'Coles'
else:
    Supermarket = ''
      
print(Supermarket)

    
#Run through OCR again, depending on which store was scanned
if Supermarket == 'Coles':
    #print("Supermarket is Coles")
    img=cv2.imread('result.jpg')
    #print(os.path.exists('result.png'))
    d = pytesseract.image_to_data("result.jpg", output_type=Output.DICT)
    n_boxes = len(d['level'])
    boxes = cv2.cvtColor(image.copy(), cv2.COLOR_BGR2RGB)
    for i in range(n_boxes):
        (x, y, w, h) = (d['left'][i], d['top'][i], d['width'][i], d['height'][i])    
    boxes = cv2.rectangle(boxes, (x, y), (x + w, y + h), (0, 255, 0), 2)
    
    plot_rgb(boxes)
    extracted_text = pytesseract.image_to_string(image)
else:
    pass
    
print(extracted_text)

#Find Date
#if Supermarket == 'Coles':
#    match = re.search(r'\d{2}/\d{2}/\d{4}', extracted_text)
#    date = datetime.strptime(match.group(), '%d/%m/%Y').date()
#elif Supermarket == 'Woolworths':
#    match = re.search(r'\d{2}/\d{2}/\d{2}', extracted_text)
#    date = datetime.strptime(match.group(), '%d/%m/%y').date()
    #date = datetime.strptime(match.group(), '%d/%m/%Y').date()
#print(date)

try:
    match = re.search(r'\d{2}/\d{2}/\d{4}', extracted_text)
    date = datetime.strptime(match.group(), '%d/%m/%Y').date()
except AttributeError:
    match = re.search(r'\d{2}/\d{2}/\d{2}', extracted_text)
    date = datetime.strptime(match.group(), '%d/%m/%y').date()

#Find costs on the receipt
amounts = find_amounts(extracted_text)
#print(amounts)

#Find number of items on the reciept
if Supermarket == 'Coles':
    items=find_number_of_items_coles(extracted_text)
elif Supermarket == 'Woolworths':
    items=find_number_of_items_woolies(extracted_text)
items=int(items)
#print(items)
#Find Total cost of items
Total_cost=sum_of_item_cost(items,amounts)
#print(Total_cost)
#Verify total cost of items
verifyed_total = verify_total(Total_cost,amounts)
if verifyed_total:
    print(Total_cost)
else:
    print("Unable to verify total")
#Above is tested and working, below still needs to be worked on



if Supermarket == "Coles":
    # Error in OCR is resulting in - showing as . Full stop in below code may need to be changed to "-" once OCR is improved
    #(For Coles)
    StoreN = find_between( extracted_text, "Store: ", "." )
    #print(StoreN)
    
    #Receipt ID (For Coles)
    Receipt_ID = find_between( extracted_text, "Receipt: ", "Date:" )
    #print(Receipt_ID)
    
    #Product descriptions and prices (For Coles)
    desc = find_between( extracted_text, "iption ", "Total" )
    
    #Lines to excluse on the receipt
    exclusion_list = ["bank", "total", "promo", "vat", "change", "recyclable"]
    
    #Words to ommit
    remove_list = ["vit", "etc"]
    
    #Extract letters and numbers regex
    regex_line = []
    for line in desc.splitlines():
        if re.search(r".[0-9]|[0-9]*\.[0-9]|[0-9]*\,[0-9]", line):
            regex_line.append(line)
    #print(regex_line)
    
    #Apply exclusion list
    food_item = []
    for eachLine in regex_line:
        found = False
        for exclude in exclusion_list:
            if exclude in eachLine.lower():
                found = True
            
        if found == False:
            food_item.append(eachLine)
    #print(food_item)
    
    #Word ommit
    new_food_item_list = []
    for item in food_item:
        for subToRemove in remove_list:
            item = item.replace(subToRemove, "")
            item = item.replace(subToRemove.upper(), "")
        new_food_item_list.append(item)
    #print(new_food_item_list)
    
    #Food item cost regex
    food_item_cost = []
    for line in new_food_item_list:
        line = line.replace(",", ".")
        cost = re.findall('\d*\.?\d+|\d*\,?\d+|',line)
        
        for possibleCost in cost:
            if "." in possibleCost:
                food_item_cost.append(possibleCost)
    #print(new_food_item_list)
    
    #Remove cost price from food item
    count = 0;
    only_food_items = []
    for item in new_food_item_list:
        only_alpha = ""
        for char in item:
            if char.isalpha() or char.isspace():
                only_alpha += char
                
        only_alpha = re.sub(r'(?:^| )\w(?:$| )', ' ', only_alpha).strip()
        only_food_items.append(only_alpha)
    #print(only_food_items)
    
    #Removes 2 letter words from food item
    #No core food item has two letters (Most cases)
    food = []
    for item in only_food_items:
        # getting splits
        temp = item.split()
    
        # omitting K lengths
        res = [ele for ele in temp if len(ele) != 2]
    
        # joining result
        res = ' '.join(res)
        
        food.append(res)
    #print(food)
    
    unwanted = {"EACH","GRAM","GRAN","NET","eer"}
    
    food = [ele for ele in food if ele not in unwanted]
    food = [x for x in food if "BETTER BAG" not in x]
    
elif Supermarket == "Woolworths":
    StoreN = find_between( extracted_text, "people", "PH" )

    Receipt_ID = find_Receipt( extracted_text, "APPROVED")

    #Product descriptions and prices (For Woolworths)
    text= extracted_text.split("\n")
    index =0
    for item in text:
        global start_index
        global end_index
        start_match=re.search("ABN",item)
        end_match=re.search("SUBTOTAL",item)
        if start_match != None:
            #print(match.group()+ str(index))
            start_index = index
        elif end_match != None:
            end_index = index
        index = index + 1
            
    desc = []
    length_of_text = len(text)
    index =0
    for item in text:
        if index > start_index and index < end_index:
            desc.append(item)
            index=index+1
        else:
            index=index+1
    
    #Lines to excluse on the receipt
    exclusion_list = ["bank", "total", "promo", "vat", "change", "recyclable"]
    
    #Words to ommit
    remove_list = ["vit", "etc"]
    
    #Extract letters and numbers regex
    regex_line = []
    for line in desc:
        if re.search(r".[0-9]|[0-9]*\.[0-9]|[0-9]*\,[0-9]", line):
            regex_line.append(line)
    #print(regex_line)
    
    #Apply exclusion list
    food_item = []
    for eachLine in regex_line:
        found = False
        for exclude in exclusion_list:
            if exclude in eachLine.lower():
                found = True
            
        if found == False:
            food_item.append(eachLine)
    #print(food_item)
    
    #Word ommit
    new_food_item_list = []
    for item in food_item:
        for subToRemove in remove_list:
            item = item.replace(subToRemove, "")
            item = item.replace(subToRemove.upper(), "")
        new_food_item_list.append(item)
    #print(new_food_item_list)
    
    #Food item cost regex
    food_item_cost = []
    for line in new_food_item_list:
        line = line.replace(",", ".")
        cost = re.findall('\d*\.?\d+|\d*\,?\d+|',line)
        
        for possibleCost in cost:
            if "." in possibleCost:
                food_item_cost.append(possibleCost)
    #print(new_food_item_list)
    
    #Remove cost price from food item
    count = 0;
    only_food_items = []
    for item in new_food_item_list:
        only_alpha = ""
        for char in item:
            if char.isalpha() or char.isspace():
                only_alpha += char
                
        only_alpha = re.sub(r'(?:^| )\w(?:$| )', ' ', only_alpha).strip()
        only_food_items.append(only_alpha)
    #print(only_food_items)
    
    #Removes 2 letter words from food item
    #No core food item has two letters (Most cases)
    food = []
    for item in only_food_items:
        # getting splits
        temp = item.split()
    
        # omitting K lengths
        res = [ele for ele in temp if len(ele) != 2]
    
        # joining result
        res = ' '.join(res)
        
        food.append(res)
    #print(food)
    
    unwanted = {"EACH","GRAM","GRAN","NET","eer"}
    
    food = [ele for ele in food if ele not in unwanted]
    food = [x for x in food if "BETTER BAG" not in x]


print(food)

#Tabulate Food Item and Cost
t = PrettyTable(['Food Item', 'Cost'])
for counter in range (0,len(food)):
    t.add_row([food[counter], food_item_cost[counter]])
print(t)


df = pd.DataFrame(food, columns=['food'])
df1 = pd.DataFrame(food_item_cost, columns=['Cost'])

df2 = pd.concat([df, df1], axis=1)
df2['Receipt_ID'] = Receipt_ID
df2['Supermarket'] = Supermarket
df2['date'] = date
df2['Store'] = StoreN
df2['Processed'] = 0
df2.dropna(inplace=True)
df2['UserID'] = UserID
df2['StoreID'] = ''
df2.head(15)

con = create_engine('mysql+pymysql://discountmateuser:DMPassword$@localhost/discountmate')

store = pd.read_sql('SELECT * FROM shops', con=con)
store.head(10)

StoreID = ''
if store['address'].str.contains(StoreN).any():
    StoreID = store.loc[store['address'] == StoreN, 'id'].iloc[0]  
    
print(StoreID)

max_value = ''
if StoreID == '':
  column = store["id"]
  max_value = column.max()
  StoreID = max_value + 1
  data = [{'id':StoreID,'name':Supermarket,'address':StoreN,'postcode':'2000'}]
  store = store.append(data,ignore_index=True,sort=False)

try:   
    for item, row in df2.iterrows():
        df2.loc[item,'Processed']=1
    df2.to_sql('ocrtable',con=con, if_exists='append',index=False)
except:
        print('Error uploading data')
        for item, row in df2.iterrows():
            df2.loc[item,'Processed']=0
    
    