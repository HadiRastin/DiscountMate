# Software Requirements Specification
## For <project name>

Version 0.1  
Prepared by <author>  
DataBytes-Organisation / DiscountMate
20/04/2024  

Table of Contents
=================
* [Revision History](#revision-history)
* 1 [Introduction](#1-introduction)
  * 1.1 [Document Purpose](#11-document-purpose)
  * 1.2 [Product Scope](#12-product-scope)
  * 1.3 [Definitions, Acronyms and Abbreviations](#13-definitions-acronyms-and-abbreviations)
  * 1.4 [References](#14-references)
  * 1.5 [Document Overview](#15-document-overview)
* 2 [Product Overview](#2-product-overview)
  * 2.1 [Product Perspective](#21-product-perspective)
  * 2.2 [Product Functions](#22-product-functions)
  * 2.3 [Product Constraints](#23-product-constraints)
  * 2.4 [User Characteristics](#24-user-characteristics)
  * 2.5 [Assumptions and Dependencies](#25-assumptions-and-dependencies)
  * 2.6 [Apportioning of Requirements](#26-apportioning-of-requirements)
* 3 [Requirements](#3-requirements)
  * 3.1 [External Interfaces](#31-external-interfaces)
    * 3.1.1 [User Interfaces](#311-user-interfaces)
    * 3.1.2 [Hardware Interfaces](#312-hardware-interfaces)
    * 3.1.3 [Software Interfaces](#313-software-interfaces)
  * 3.2 [Functional](#32-functional)
  * 3.3 [Quality of Service](#33-quality-of-service)
    * 3.3.1 [Performance](#331-performance)
    * 3.3.2 [Security](#332-security)
    * 3.3.3 [Reliability](#333-reliability)
    * 3.3.4 [Availability](#334-availability)
  * 3.4 [Compliance](#34-compliance)
  * 3.5 [Design and Implementation](#35-design-and-implementation)
    * 3.5.1 [Installation](#351-installation)
    * 3.5.2 [Distribution](#352-distribution)
    * 3.5.3 [Maintainability](#353-maintainability)
    * 3.5.4 [Reusability](#354-reusability)
    * 3.5.5 [Portability](#355-portability)
    * 3.5.6 [Cost](#356-cost)
    * 3.5.7 [Deadline](#357-deadline)
    * 3.5.8 [Proof of Concept](#358-proof-of-concept)
* 4 [Verification](#4-verification)
* 5 [Appendixes](#5-appendixes)

## Revision History
| Name | Date    | Reason For Changes  | Version   |
| ---- | ------- | ------------------- | --------- |
|      |         |                     |           |
|      |         |                     |           |
|      |         |                     |           |

## 1. Introduction
> This section should provide an overview of the entire document

### 1.1 Document Purpose
Describe the purpose of the SRS and its intended audience.

### 1.2 Product Scope
Identify the product whose software requirements are specified in this document, including the revision or release number. Explain what the product that is covered by this SRS will do, particularly if this SRS describes only part of the system or a single subsystem. Provide a short description of the software being specified and its purpose, including relevant benefits, objectives, and goals. Relate the software to corporate goals or business strategies. If a separate vision and scope document is available, refer to it rather than duplicating its contents here.

### 1.3 Definitions, Acronyms and Abbreviations

### 1.4 References
List any other documents or Web addresses to which this SRS refers. These may include user interface style guides, contracts, standards, system requirements specifications, use case documents, or a vision and scope document. Provide enough information so that the reader could access a copy of each reference, including title, author, version number, date, and source or location.

### 1.5 Document Overview
Describe what the rest of the document contains and how it is organized.

## 2. Product Overview

The DiscountMate project seeks to empower consumers with the ability to make their lives easier by providing reliable information regarding discounted items of interests from various supermarket chains, affording them the opportunity to save potentially hundreds of dollars off their weekly grocery shopping with minimal effort.
Item information is updated regularly through data collection techniques such as web-scraping, prices are then compared between various providers for the same item and those with the highest potential for savings are presented to consumers.

Additionally, the project aims to employ machine learning and data analysis techniques to identify patterns and predict future discount opportunities, providing consumers with relevant recommendations according to their interests and purchase history.
History is obtained through user interaction methods such as item searches, checking off items on a shopping list to indicate a purchase, and scanning purchase receipts by utilizing optical character recognition (OCR) technology and extracting necessary data.

### 2.1 Product Perspective
The DiscountMate project is a new, self-contained product designed to help consumers save money on their grocery shopping by providing them with reliable information on discounted items from various supermarket chains. It is not part of an existing product family, nor is it a replacement for any specific system. Instead, it serves as a unique platform that combines real-time data collection, machine learning, and user interaction to offer users significant savings and a more streamlined shopping experience.

#### 2.1.1 Context and Origin
DiscountMate emerged from the need to provide consumers with accurate and up-to-date information on discounted products across major supermarket chains. With the rising cost of living and the increased use of technology in everyday life, consumers are looking for smarter ways to shop. DiscountMate addresses this need by allowing users to compare prices, view promotions, and create personalized shopping lists that highlight the best deals.

#### 2.1.2 System Overview
DiscountMate is a standalone application that relies on several key components to deliver its functionality:

##### Data Collection and Integration

The application uses web-scraping techniques to collect data from various supermarket chains, ensuring that product information and pricing are kept up-to-date. Data is   then integrated into the system's database, allowing users to access this information for comparison and recommendation purposes.

##### Machine Learning and Data Analysis:

The system employs machine learning algorithms to identify patterns and predict future discount opportunities.
This capability allows DiscountMate to provide personalized product recommendations based on user interactions, such as search history, shopping list modifications, and scanned purchase receipts (using Optical Character Recognition, or OCR).

##### User Interaction and Personalization
Users can create profiles, enabling them to save shopping lists and rate or comment on purchased items.
The application provides various search and recommendation features to help users find discounted products quickly.
The system also offers a mapping function to help users locate nearby stores and navigate to them.

##### External Interfaces and Integration
DiscountMate can interface with external applications such as mapping software to provide location-based services.
It also integrates with user devices for features like scanning purchase receipts using OCR, which extracts data for further analysis.

#### 2.1.3 Component Relationships and Interactions
The following diagram illustrates the major components of the DiscountMate system and their interactions.

**We need a figure here.**

### 2.2 Product Functions
Summarize the major functions the product must perform or must let the user perform. Details will be provided in Section 3, so only a high level summary (such as a bullet list) is needed here. Organize the functions to make them understandable to any reader of the SRS. A picture of the major groups of related requirements and how they relate, such as a top level data flow diagram or object class diagram, is often effective.

### 2.3 Product Constraints
This subsection should provide a general description of any other items that will limit the developer’s options. These may include:  

* Interfaces to users, other applications or hardware.  
* Quality of service constraints.  
* Standards compliance.  
* Constraints around design or implementation.

### 2.4 User Characteristics
Identify the various user classes that you anticipate will use this product. User classes may be differentiated based on frequency of use, subset of product functions used, technical expertise, security or privilege levels, educational level, or experience. Describe the pertinent characteristics of each user class. Certain requirements may pertain only to certain user classes. Distinguish the most important user classes for this product from those who are less important to satisfy.

### 2.5 Assumptions and Dependencies
List any assumed factors (as opposed to known facts) that could affect the requirements stated in the SRS. These could include third-party or commercial components that you plan to use, issues around the development or operating environment, or constraints. The project could be affected if these assumptions are incorrect, are not shared, or change. Also identify any dependencies the project has on external factors, such as software components that you intend to reuse from another project, unless they are already documented elsewhere (for example, in the vision and scope document or the project plan).

### 2.6 Apportioning of Requirements
Apportion the software requirements to software elements. For requirements that will require implementation over multiple software elements, or when allocation to a software element is initially undefined, this should be so stated. A cross reference table by function and software element should be used to summarize the apportioning.

Identify requirements that may be delayed until future versions of the system (e.g., blocks and/or increments).

## 3. Requirements
> This section specifies the software product's requirements. Specify all of the software requirements to a level of detail sufficient to enable designers to design a software system to satisfy those requirements, and to enable testers to test that the software system satisfies those requirements.

### 3.1 External Interfaces
> This subsection defines all the inputs into and outputs requirements of the software system. Each interface defined may include the following content:
* Name of item
* Source of input or destination of output
* Valid range, accuracy, and/or tolerance
* Units of measure
* Timing
* Relationships to other inputs/outputs
* Screen formats/organization
* Window formats/organization
* Data formats
* Command formats
* End messages

#### 3.1.1 User interfaces
Define the software components for which a user interface is needed. Describe the logical characteristics of each interface between the software product and the users. This may include sample screen images, any GUI standards or product family style guides that are to be followed, screen layout constraints, standard buttons and functions (e.g., help) that will appear on every screen, keyboard shortcuts, error message display standards, and so on. Details of the user interface design should be documented in a separate user interface specification.

Could be further divided into Usability and Convenience requirements.

#### 3.1.2 Hardware interfaces
Describe the logical and physical characteristics of each interface between the software product and the hardware components of the system. This may include the supported device types, the nature of the data and control interactions between the software and the hardware, and communication protocols to be used.

#### 3.1.3 Software interfaces
Describe the connections between this product and other specific software components (name and version), including databases, operating systems, tools, libraries, and integrated commercial components. Identify the data items or messages coming into the system and going out and describe the purpose of each. Describe the services needed and the nature of communications. Refer to documents that describe detailed application programming interface protocols. Identify data that will be shared across software components. If the data sharing mechanism must be implemented in a specific way (for example, use of a global data area in a multitasking operating system), specify this as an implementation constraint.

### 3.2 Functional
#### 3.2.1 Functional Requirement 1 
The system must enable users to view all grocery stores products with up to date catalogue, and all current promotions.

**Rationale**: In order to catch every chance of sales, users should be able to browse all grocery products from catalogue with all the current promotions. This is the key foundation function of the system.

#### 3.2.2  Functional Requirement 2 
The system must enable users to search for products by varying identifiers, included name, brand, price and promotions. 

**Rationale**: Search is a key function for the usage of the system. Users with an idea of their target to buy a product could find out the item quickly from the system. That largely reduces the time users need to find the product from browsing the full product list. 

#### 3.2.3  Functional Requirement 3
The system should auto suggest a list of the recommended product when users types in a product name in the search function.

**Rationale**: The auto suggestion function is part of the recommendation system in the backend which produce recommended product to users based on machine learning algorithm that learned from user shopping habit and shopping transaction records in the system. This function is important in assisting users shopping process.

#### 3.2.4  Functional Requirement 4 

The system must present a search result with the display of a thumbnail of every relevant product together with a brief product description.

**Rationale**: It is very important to provide product image and description for their information on their buying choice.

#### 3.2.5 Functional Requirement 5 

The system must require users to create a profile if they don’t have before they could save their shopping list in the system.  

**Rationale**: Users without this information filled in the system must not be allowed to save any shopping list.

#### 3.2.6  Functional Requirement 6 

The system must require the following detail when the customer creates a profile: a username; a password which must be at least 8 characters in length.

**Rationale**: Users must enter their username and password for their login to the system.

#### 3.2.7  Functional Requirement 7

The system should provide functions for login users to create, to modify, to save and to delete multiple shopping list. The system should allow login users to load the saved shopping list for them to check the individual item price and total shopping list price of multiple grocery stores in the system 

**Rationale**: The function allow users to compare their interested product price of multiple grocery stores in a time saving, regularly basis. It could greatly reduce the tedious work of selecting the same list of products from time to time.

#### 3.2.8 Functional Requirement 8

The system should provide functions for login users to add and to remove multiple items in the shopping list.

**Rationale**: Users could add, remove item in the shopping list according to their need.

#### 3.2.9 Functional Requirement 9

The system should provide rating function for users to give rate and comment to an item. Existing rating and comment of an item is public to all users.

**Rationale**: Users could check the rating and comment for their shopping decision. The system will make use of the rating in the machine learning algorithm to calculate the recommendation item list for each of the user.

#### 3.2.10 Functional Requirement 10

The system should provide a list of recommendation items when user add an item into the shopping list. The list is generated by the machine learning algorithm on the fly. 

**Rationale**: To provide best buying option for users to save money and make better shopping decision.

#### 3.2.11 Functional Requirement 11

The system should provide a map function that use users real time location to search and display the route to get to the nearest Woolworth or Coles stores which is still open at the time.

**Rationale**: Once users compared the price and decision to go one of the grocery store, this function save their time by preventing them leaving the app to open the map routing app separately.

#### 3.2.12 Functional Requirement 12
The system should allow users to report errors or inaccuracies in product information, including incorrect prices, descriptions, or promotions.

**Rationale**: Providing a mechanism for users to report errors helps ensure data accuracy and builds trust with users. It also enables the system to quickly address and correct any discrepancies in the product catalogue.

#### 3.2.13 Functional Requirement 13
The system should allow users to create a wish list of products they intend to purchase in the future.

**Rationale**: A wish list feature enables users to save items for later, helping them remember products they are interested in purchasing when they are ready to shop.

#### 3.2.14 Functional Requirement 14
The system should allow users to rate and review products they have purchased, providing feedback on factors such as quality, value for money, and overall satisfaction.

**Rationale**: Collecting user feedback on purchased items helps improve the quality of product recommendations and provides valuable insights to other users considering the same products. It also offers the system valuable data to refine its recommendation algorithms.

#### 3.2.15 Functional Requirement 15
The system should use user feedback and purchase history to improve personalized product recommendations.

**Rationale**: By incorporating user feedback into the recommendation engine, the system can offer more relevant product suggestions, enhancing the user experience and encouraging more purchases. This approach leverages user-generated data to create a more tailored shopping experience.

#### 3.2.16 Functional Requirement 16
The system should provide users with an option to mark certain products as favorites, indicating a strong preference for use in future recommendations.

**Rationale**: Allowing users to mark products as favorites provides another data point for the recommendation engine, helping to better tailor suggestions based on user preferences. It also gives users a convenient way to quickly find their most-liked products.

### 3.3 Quality of Service
> This section states additional, quality-related property requirements that the functional effects of the software should present.

#### 3.3.1 Performance
If there are performance requirements for the product under various circumstances, state them here and explain their rationale, to help the developers understand the intent and make suitable design choices. Specify the timing relationships for real time systems. Make such requirements as specific as possible. You may need to state performance requirements for individual functional requirements or features.

#### 3.3.2 Security
Specify any requirements regarding security or privacy issues surrounding use of the product or protection of the data used or created by the product. Define any user identity authentication requirements. Refer to any external policies or regulations containing security issues that affect the product. Define any security or privacy certifications that must be satisfied.

#### 3.3.3 Reliability
Specify the factors required to establish the required reliability of the software system at time of delivery.

#### 3.3.4 Availability
Specify the factors required to guarantee a defined availability level for the entire system such as checkpoint, recovery, and restart.

### 3.4 Compliance
Specify the requirements derived from existing standards or regulations, including:  
* Report format
* Data naming
* Accounting procedures
* Audit tracing

For example, this could specify the requirement for software to trace processing activity. Such traces are needed for some applications to meet minimum regulatory or financial standards. An audit trace requirement may, for example, state that all changes to a payroll database shall be recorded in a trace file with before and after values.

### 3.5 Design and Implementation

#### 3.5.1 Installation
Constraints to ensure that the software-to-be will run smoothly on the target implementation platform.

#### 3.5.2 Distribution
Constraints on software components to fit the geographically distributed structure of the host organization, the distribution of data to be processed, or the distribution of devices to be controlled.

#### 3.5.3 Maintainability
Specify attributes of software that relate to the ease of maintenance of the software itself. These may include requirements for certain modularity, interfaces, or complexity limitation. Requirements should not be placed here just because they are thought to be good design practices.

#### 3.5.4 Reusability
<!-- TODO: come up with a description -->

#### 3.5.5 Portability
Specify attributes of software that relate to the ease of porting the software to other host machines and/or operating systems.

#### 3.5.6 Cost
Specify monetary cost of the software product.

#### 3.5.7 Deadline
Specify schedule for delivery of the software product.

#### 3.5.8 Proof of Concept
<!-- TODO: come up with a description -->

## 4. Verification
> This section provides the verification approaches and methods planned to qualify the software. The information items for verification are recommended to be given in a parallel manner with the requirement items in Section 3. The purpose of the verification process is to provide objective evidence that a system or system element fulfills its specified requirements and characteristics.

<!-- TODO: give more guidance, similar to section 3 -->
<!-- ieee 15288:2015 -->

## 5. Appendixes
