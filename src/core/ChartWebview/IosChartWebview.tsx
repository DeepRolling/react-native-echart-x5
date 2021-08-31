import React, { useEffect, useRef } from 'react';
import { WebView as RNWebView } from 'react-native-webview';
import { renderChart, EchartConfig } from '../TemplateGenerator';
import type { WebViewMessageEvent } from 'react-native-webview-tencentx5/lib/WebViewTypes';
import { HtmlTemplate } from '../skeleton/ChartHtmlSkeleton';

export function IosChartWebview(props: {
  echartConfig: EchartConfig;
  androidHardwareAccelerationDisabled?: boolean;
  onLoadFinish?: () => void;
  onMessage?: (event: WebViewMessageEvent) => void;
}) {
  const chart = useRef<RNWebView>(null);

  const onLoadEnd = () => {
    console.log(
      'react-native native browser load initialize html : ' + props.echartConfig
    );
    chart.current?.injectJavaScript(renderChart(props.echartConfig));
    props.onLoadFinish?.();
    loadFinishTag.current = true;
  };

  const loadFinishTag = useRef<boolean>(false);

  useEffect(() => {
    if (loadFinishTag.current) {
      console.log(
        'react-native native browser dispatch newest html after load finish : ' +
          props.echartConfig
      );
      //fuck the reload and the damned blank screen , get work-around by manipulate DOM in html + use loading for first launch
      // chart.current?.reload();
      chart.current?.postMessage(JSON.stringify(props.echartConfig.options));
    }
  }, [props.echartConfig]);

  return (
    <RNWebView
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        opacity: 0.99,
        backgroundColor: 'transparent',
      }}
      androidHardwareAccelerationDisabled={
        props.androidHardwareAccelerationDisabled === true
      }
      scrollEnabled={false}
      onMessage={props.onMessage}
      scalesPageToFit
      javaScriptEnabled
      ref={chart}
      source={{ html: HtmlTemplate }}
      onLoadEnd={onLoadEnd}
      originWhitelist={['*']}
      {...props}
    />
  );
}
