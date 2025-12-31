import React from 'react';
import Header from '../components/Theme/Header';
import Footer from '../components/Theme/Footer';
import '../assets/theme/theme.scss'; // Import global styles from the theme

const CustomThemeLayout = ({ children, config }) => {
    // Default configuration if none provided
    const themeConfig = {
        colors: {
            primary: '#12f568',
            secondary: '#000000',
            text: '#000000',
            background: '#ffffff',
            footerBg: '#000000',
            footerText: '#ffffff',
            ...config?.colors
        },
        content: {
            logoUrl: null,
            shopName: 'ASSIMΕ',
            ...config?.content
        }
    };

    const style = {
        '--color-primary': themeConfig.colors.primary,
        '--color-primary-text': '#ffffff', // Could be calculated based on contrast
        '--color-text': themeConfig.colors.text,
        '--color-background': themeConfig.colors.background,
        '--color-footer-bg': themeConfig.colors.footerBg,
        '--color-footer-text': themeConfig.colors.footerText,
        '--color-nav-bg': '#ffffff',
        '--color-nav-text': '#000000',
        '--color-border': '#e8e8e1',
        '--color-accent': '#ff4f33',
    };

    React.useEffect(() => {
        // Facebook Pixel
        if (config?.facebookPixelId) {
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () {
                    n.callMethod ?
                    n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                n.queue = []; t = b.createElement(e); t.async = !0;
                t.src = v; s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s)
            }(window, document, 'script',
                'https://connect.facebook.net/en_US/fbevents.js');

            fbq('init', config.facebookPixelId);
            fbq('track', 'PageView');
        }

        // Google Analytics
        if (config?.googleAnalyticsId) {
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
            script.async = true;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', config.googleAnalyticsId);
        }
    }, [config?.facebookPixelId, config?.googleAnalyticsId]);

    return (
        <div className="custom-theme-wrapper font-sans text-gray-900 antialiased" style={style}>
            <Header config={themeConfig} />
            <main id="MainContent" className="main-content" role="main">
                {children}
            </main>
            <Footer config={themeConfig} />
        </div>
    );
};

export default CustomThemeLayout;
