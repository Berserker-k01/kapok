import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';

const Header = ({ config }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { logoUrl, shopName } = config?.content || { shopName: 'ASSIMΕ' };

    return (
        <div data-section-type="header-section">
            <header className="site-header border-b border-gray-200 bg-white">
                <div className="page-width max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="header-layout flex items-center justify-between h-20">

                        {/* Mobile Menu Button */}
                        <div className="header-item header-item--left md:hidden">
                            <button
                                type="button"
                                className="site-nav__link p-2"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                        {/* Logo */}
                        <div className="header-item header-item--logo text-center md:text-left flex-1 md:flex-none">
                            <Link to="/" className="text-2xl font-bold tracking-tight text-gray-900">
                                {logoUrl ? (
                                    <img src={logoUrl} alt={shopName} className="h-10 w-auto object-contain" />
                                ) : (
                                    shopName
                                )}
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="header-item header-item--navigation hidden md:block flex-1 px-8">
                            <nav className="site-nav flex justify-center space-x-8">
                                <Link to="/" className="site-nav__link text-base font-medium text-gray-900 hover:text-gray-600">
                                    Accueil
                                </Link>
                                <Link to="/catalog" className="site-nav__link text-base font-medium text-gray-900 hover:text-gray-600">
                                    Catalogue
                                </Link>
                                <Link to="/about" className="site-nav__link text-base font-medium text-gray-900 hover:text-gray-600">
                                    À propos
                                </Link>
                                <Link to="/contact" className="site-nav__link text-base font-medium text-gray-900 hover:text-gray-600">
                                    Contact
                                </Link>
                            </nav>
                        </div>

                        {/* Icons */}
                        <div className="header-item header-item--icons flex items-center space-x-4">
                            <button className="site-nav__link p-2 text-gray-900 hover:text-gray-600">
                                <Search size={24} />
                            </button>
                            <Link to="/cart" className="site-nav__link p-2 text-gray-900 hover:text-gray-600 relative">
                                <ShoppingCart size={24} />
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                    0
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200">
                        <nav className="flex flex-col p-4 space-y-4">
                            <Link to="/" className="text-base font-medium text-gray-900">Accueil</Link>
                            <Link to="/catalog" className="text-base font-medium text-gray-900">Catalogue</Link>
                            <Link to="/about" className="text-base font-medium text-gray-900">À propos</Link>
                            <Link to="/contact" className="text-base font-medium text-gray-900">Contact</Link>
                        </nav>
                    </div>
                )}
            </header>
        </div>
    );
};

export default Header;
