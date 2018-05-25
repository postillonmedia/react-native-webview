import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { WebView as RNWebView } from 'react-native';


const injectedJavaScript = function () {
    var last_body_size = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
    };

    function checkBodySizeChange() {
        var width_changed = last_body_size.width !== document.documentElement.clientWidth,
            height_changed = last_body_size.height !== document.documentElement.clientHeight;


        if(width_changed || height_changed) {
            last_body_size = {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };

            postHeight();
        }

        window.requestAnimationFrame(checkBodySizeChange);
    }

    function postHeight() {
        var height = 0;
        if (document.documentElement.clientHeight > document.body.clientHeight) {
            height = document.documentElement.clientHeight;
        } else {
            height = document.body.clientHeight;
        }
        postMessage(height);
    }

    function waitForBridge() {
        if (window.postMessage.length !== 1) {
            setTimeout(waitForBridge, 200);
        } else {
            window.requestAnimationFrame(checkBodySizeChange);

            postHeight();
        }
    }

    waitForBridge();
};


export class WebView extends PureComponent {

    static propTypes = {
        ...RNWebView.propTypes,

        autoHeight: PropTypes.bool,
    };

    static defaultProps = {
        autoHeight: true,

        scrollEnabled: false,
        javaScriptEnabled: true,
        automaticallyAdjustContentInsets: true,
    };

    injectedJavaScript;
    webview;

    constructor() {
        super(...arguments);

        this.injectedJavaScript = '(' + String(injectedJavaScript) + ')();window.postMessage = String(Object.hasOwnProperty).replace(\'hasOwnProperty\', \'postMessage\');';

        this.state = {
            height: this.props.defaultHeight,
        };
    }

    refWebView = (ref) => {
        this.webview = ref;
    };

    onMessage = (e) => {
        this.setState({
            height: parseInt(e.nativeEvent.data),
        });
    };

    render() {
        const { height } = this.state;
        const { autoHeight, style } = this.props;

        const heightStyle = {};

        autoHeight && (heightStyle['height'] = height);

        return (
            <RNWebView
                {...this.props}

                ref={this.refWebView}

                style={[style, heightStyle]}
                onMessage={this.onMessage}
                injectedJavaScript={this.injectedJavaScript}
            />
        );
    }

}


export default WebView;