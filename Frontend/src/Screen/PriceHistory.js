import { useRoute } from '@react-navigation/native';
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import api from '../core/Service';



const xPadding = 40;
const yPadding = 20;
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const chartWidth = screenWidth - xPadding * 2;

const chartHeight = 180 - yPadding * 2;
let maxValue = 100;



const PriceHistory = () => {

    const route = useRoute();
    const { id } = route.params;
    console.log('Item IDDDDHistory: ', id);

    useEffect(() => { getItemHist() }, []);

    const [itemListHist, setItemListHist] = useState();




    const getItemHist = async () => {
        const postobj = { id: id }
        await axios.post(`${api}/item/searchHistory`, postobj)
            .then(function (response) {
                if (response) {
                    setItemListHist(response?.data);
                    console.log('The responseeee: ');
                }
            })
            .catch(function (error) {
                console.warn("ERROR: " + error);
            })
    }


    console.log('ItemListHistttttttt: ', itemListHist);

    
    console.log('First item in the list: ', itemListHist && itemListHist[0]?.IPH_DATE.substr(0, 10));


    const [xScale, setXScale] = useState(() => (date) => 0);
   
    useEffect(() => {
        // Initialize xScale function here
        if (itemListHist && itemListHist.length > 0) {
            setXScale(() => (date) => ((new Date(date) - new Date(itemListHist[0].IPH_DATE.substr(0, 10)) )/ (280 * 60 * 60 * 24 * 30)) * (chartWidth / (itemListHist.length - 1)));
            //xScale = (date) => ((new Date(date) - new Date(itemListHist[0]).IPH_DATE.substr(0, 10)) / (1000 * 60 * 60 * 24 * 30)) * (chartWidth / (itemListHist.length - 1));
            maxValue = (Math.max(... itemListHist.map((d) => d.IPH_ITEM_BASE_PRICE)));
            console.log('I am in xscaleeeeeeee max valueeee: ', maxValue);
            if (maxValue === 0) {
                maxValue = 100; // Set maxValue to 100
            }
        }
    }, [itemListHist]);

   
    const yScale = (price) => (chartHeight - (price / maxValue) * chartHeight);


    return (
        <View style={styles.container}>
            <Svg width={screenWidth} height={220}>
                <G x={xPadding} y={yPadding}>
                    {/* X-axis */}
                    <Line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#ccc" strokeWidth="1" />

                    {itemListHist && itemListHist.map((d) => (
                        <React.Fragment key={d.IPH_DATE.substr(0, 10)}>


                            <Line x1={xScale(d.IPH_DATE.substr(0, 10))} y1={chartHeight} x2={xScale(d.IPH_DATE.substr(0, 10))} y2={chartHeight + 5} stroke="#ccc" strokeWidth="1" />
                            <SvgText x={xScale(d.IPH_DATE.substr(0, 10))} y={chartHeight + 15} fill="#333" fontSize="8" textAnchor="start">
                                {d.IPH_DATE.substr(0, 10)}
                            </SvgText>


                        </React.Fragment>

                    ))}


                    {/* Y-axis */}
                    <Line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#ccc" strokeWidth="1" />
                    <SvgText x="-10" y="-10" fill="#333" fontSize="10" textAnchor="end">
                        {`$${maxValue}`}
                    </SvgText>
                    <SvgText x="-10" y={chartHeight + 10} fill="#333" fontSize="10" textAnchor="end">
                        0
                    </SvgText>


                    {/* First label */}
                    <SvgText x={40} y={chartHeight + 50} fill="#333" fontSize="10" textAnchor="end">
                        Woolworths: Red
                    </SvgText>

                    {/* Second label */}
                    <SvgText x={40} y={chartHeight + 60} fill="#333" fontSize="10" textAnchor="end">
                        Coles: Blue
                    </SvgText>

                    {/* Data points */}
                    {itemListHist && itemListHist.map((d) => (
                        <Circle key={d.IPH_DATE.substr(0, 10)} cx={xScale(d.IPH_DATE.substr(0, 10))} cy={yScale(d.IPH_ITEM_BASE_PRICE)} r="4" fill={d.COM_ID === 2 ? "blue" : d.COM_ID === 1 ? "red" : "#007bff"} />
                    ))}
                    {/* Line connecting data points */}
                    {itemListHist && itemListHist.map((d) => (
                        <Path d={`M ${xScale(itemListHist[0].IPH_DATE.substr(0, 10))}, ${yScale(itemListHist[0].IPH_ITEM_BASE_PRICE)} ${itemListHist
                            .map((d) => `L ${xScale(d.IPH_DATE.substr(0, 10))}, ${yScale(d.IPH_ITEM_BASE_PRICE)}`)
                            .join(' ')}`} fill="none" stroke={itemListHist[0].COM_ID === 2 ? "blue" : itemListHist[0].COM_ID === 1 ? "red" : "#007bff"} strokeWidth="2" />
                    ))}
                </G>
            </Svg>






        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    date: {
        fontSize: 16,
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
    },

});

export default PriceHistory;



