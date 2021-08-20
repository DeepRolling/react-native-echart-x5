import React, { useEffect, useRef } from 'react';
import { WebView as RNWebView } from 'react-native-webview-tencentx5';
import { renderChart, EchartConfig } from '../TemplateGenerator';
import type { WebViewMessageEvent } from 'react-native-webview-tencentx5/lib/WebViewTypes';
import { HtmlTemplate } from '../skeleton/ChartHtmlSkeleton';

export function AndroidChartX5Webview(props: {
  echartConfig: EchartConfig;
  androidHardwareAccelerationDisabled?: boolean;
  onLoadFinish?: () => void;
  onMessage?: (event: WebViewMessageEvent) => void;
}) {
  const chart = useRef<RNWebView>(null);

  const onLoadEnd = () => {
    console.log(
      'tecent x5 browser load initialize html : ' +  JSON.stringify(props.echartConfig.options)
    );
    chart.current?.injectJavaScript(renderChart(props.echartConfig));

    setTimeout(() => {
      props.onLoadFinish?.();
      loadFinishTag.current = true;
    }, 500);
  };

  const loadFinishTag = useRef<boolean>(false);

  useEffect(() => {
    if (loadFinishTag.current) {
      console.log(
        'tecent x5 browser dispatch newest html after load finish : ' +
          JSON.stringify(props.echartConfig.options)
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
