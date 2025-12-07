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
