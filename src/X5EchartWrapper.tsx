import React, { useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { AndroidChartX5Webview } from './core/ChartWebview/AndroidChartX5Webview';
import { IosChartWebview } from './core/ChartWebview/IosChartWebview';
import type {
  CustomWebViewMessage,
  EchartConfig,
} from './core/TemplateGenerator';
import type { WebViewMessageEvent } from 'react-native-webview-tencentx5-fix';
import { WebViewMessageTYpe } from './core/TemplateGenerator';
import type { EChartOption } from 'echarts';

export type X5EchartPropsWithCallback<TSeries = EChartOption.Series> = {
  /**
   * passed down to webview that integration with echart ,
   * so they can get echart config and generate correspond javascript for webview
   */
  echartConfig: EchartConfig<TSeries>;
  /**
   * whether echartConfig already have valid data or not
   * if this field is false , a loading will display over webview(loading can be custom)
   */
  optionAlreadyFillData: boolean;
  /**
   * pass a custom loading display over webview when data not filled yet
   */
  customLoadingView?: any;
  /**
   * this function will be call when echart emit data-zoom message
   * @param data
   */
  onDataZoom?: (data: any) => void;
  /**
   * this function will be call when echart emit onClick message
   * @param data
   */
  onPress?: (data: any) => void;

  /**
   * you can't add function to echart options , because function can't be serialized
   * only pure javascript object can be serialized and passed between js-code and native-code through JsBridge
   * so if you have some function need to supply to echart options , use this function return a js function formatted by string
   * for example :
   * onExecuteJavascritFunction={()=>{
                const customToolTipScript = `
                      myChart.setOption(
                        {
                            tooltip:{
                                 show: true,
                                 trigger: 'axis',
                                 formatter: function (params, ticket, callback) {
                                    try{
                                        let yAxisValue = params[0].data[1];
                                        yAxisValue = yAxisValue.toFixed(2);
                                        return params[0].data[0] + '</br>' + yAxisValue + '${props.dataUnit}';
                                    }catch(e){
                                        console.log('EChartBarChart (error when inject toolkit function) : ' + e.toString());
                                    }
                                 }
                            }
                        },
                        {replaceMerge: ['tooltip']}
                      )
                `
                return customToolTipScript
            }}
   */
  onExecuteJavascriptFunction?: () => string;
  /**
   * pass true to get Echart log print
   */
  debugMode?: boolean;
};

export function X5EchartWrapper<TSeries = EChartOption.Series>(
  props: X5EchartPropsWithCallback<TSeries>
) {
  const [waringBarChartLoadFinish, setWaringBarChartLoadFinish] =
    useState<boolean>(false);
  const {
    customLoadingView,
    debugMode,
    echartConfig,
    onDataZoom,
    onExecuteJavascriptFunction,
    onPress,
    optionAlreadyFillData,
  } = props;

  /**
   * when webview send message to native (message have a custom wrapper)
   * @param event message send by webview
   */
  const onMessage = (event: WebViewMessageEvent) => {
    // 判断监听类型
    const webviewMessage = JSON.parse(
      event.nativeEvent.data
    ) as CustomWebViewMessage;
    switch (webviewMessage.type) {
      case WebViewMessageTYpe.DATA_ZOOM:
        onDataZoom?.(webviewMessage.value);
        break;
      case WebViewMessageTYpe.LOG:
        debugMode && console.log('Echart Log : ' + webviewMessage.value);
        break;
      case WebViewMessageTYpe.CLICK:
        onPress?.(JSON.parse(webviewMessage.value));
        break;
    }
  };

  return (
    <View
      style={{
        width: echartConfig.width,
        height: echartConfig.height,
      }}
    >
      {Platform.OS !== 'ios' ? (
        <AndroidChartX5Webview
          echartConfig={echartConfig}
          onLoadFinish={() => {
            setWaringBarChartLoadFinish(true);
          }}
          onMessage={onMessage}
          debugMode={debugMode}
          onExecuteJavascriptFunction={onExecuteJavascriptFunction}
        />
      ) : (
        <IosChartWebview
          echartConfig={echartConfig}
          onLoadFinish={() => {
            setWaringBarChartLoadFinish(true);
          }}
          onMessage={onMessage}
          debugMode={debugMode}
          onExecuteJavascriptFunction={onExecuteJavascriptFunction}
        />
      )}
      {waringBarChartLoadFinish && optionAlreadyFillData ? null : (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: echartConfig.backgroundColor,
            position: 'absolute',
            top: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          {customLoadingView !== undefined ? (
            customLoadingView
          ) : (
            <ActivityIndicator color={'black'} size={200} />
          )}
        </View>
      )}
    </View>
  );
}
