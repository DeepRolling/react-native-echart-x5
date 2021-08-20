import React, { useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { AndroidChartX5Webview } from './core/ChartWebview/AndroidChartX5Webview';
import { IosChartWebview } from './core/ChartWebview/IosChartWebview';
import type {
  CustomWebViewMessage,
  EchartConfig,
} from './core/TemplateGenerator';
import type { WebViewMessageEvent } from 'react-native-webview-tencentx5/lib/WebViewTypes';
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
};

export function X5EchartWrapper<TSeries = EChartOption.Series>(
  props: X5EchartPropsWithCallback<TSeries>
) {
  const [waringBarChartLoadFinish, setWaringBarChartLoadFinish] =
    useState<boolean>(false);

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
        props.onDataZoom?.(webviewMessage.value);
        break;
      case WebViewMessageTYpe.LOG:
        console.log('Echart Log : ' + webviewMessage.value);
        break;
      case WebViewMessageTYpe.CLICK:
        props.onPress?.(JSON.parse(webviewMessage.value));
        break;
    }
  };

  return (
    <View
      style={{
        width: props.echartConfig.width,
        height: props.echartConfig.height,
      }}
    >
      {Platform.OS !== 'ios' ? (
        <AndroidChartX5Webview
          echartConfig={props.echartConfig}
          onLoadFinish={() => {
            setWaringBarChartLoadFinish(true);
          }}
          onMessage={onMessage}
        />
      ) : (
        <IosChartWebview
          echartConfig={props.echartConfig}
          onLoadFinish={() => {
            setWaringBarChartLoadFinish(true);
          }}
          onMessage={onMessage}
        />
      )}
      {waringBarChartLoadFinish && props.optionAlreadyFillData ? null : (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: props.echartConfig.backgroundColor,
            position: 'absolute',
            top: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          {props.customLoadingView !== undefined ? (
            props.customLoadingView
          ) : (
            <ActivityIndicator color={'black'} size={200} />
          )}
        </View>
      )}
    </View>
  );
}
