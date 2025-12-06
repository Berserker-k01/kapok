import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = ({ config }) => {
    const { shopName } = config?.content || { shopName: 'LESIGNE' };

    return (
        <footer className="site-footer pt-16 pb-8" style={{ backgroundColor: 'var(--color-footer-bg)', color: 'var(--color-footer-text)' }}>
            <div className="page-width max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

                    {/* About */}
                    <div className="footer__item">
                        <h3 className="text-lg font-bold mb-4">À propos</h3>
                        <p className="opacity-80 text-sm leading-relaxed">
                            Découvrez notre collection exclusive. Qualité et style pour tous les goûts.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer__item">
                        <h3 className="text-lg font-bold mb-4">Liens Rapides</h3>
                        <ul className="space-y-2">
                            <li><Link to="/search" className="opacity-80 hover:opacity-100 text-sm">Recherche</Link></li>
                            <li><Link to="/about" className="opacity-80 hover:opacity-100 text-sm">Notre Histoire</Link></li>
                            <li><Link to="/contact" className="opacity-80 hover:opacity-100 text-sm">Nous Contacter</Link></li>
                            <li><Link to="/faq" className="opacity-80 hover:opacity-100 text-sm">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="footer__item">
                        <h3 className="text-lg font-bold mb-4">Newsletter</h3>
                        <p className="opacity-80 text-sm mb-4">
                            Inscrivez-vous pour recevoir nos dernières offres.
                        </p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Votre email"
                                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-l-md focus:outline-none focus:ring-1 focus:ring-white placeholder-white/50"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-white text-gray-900 font-medium rounded-r-md hover:bg-gray-100"
                            >
                                OK
                            </button>
                        </form>
                    </div>

                    {/* Social */}
                    <div className="footer__item">
                        <h3 className="text-lg font-bold mb-4">Suivez-nous</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="opacity-80 hover:opacity-100"><Facebook size={20} /></a>
                            <a href="#" className="opacity-80 hover:opacity-100"><Instagram size={20} /></a>
                            <a href="#" className="opacity-80 hover:opacity-100"><Twitter size={20} /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="opacity-60 text-sm">
                        &copy; {new Date().getFullYear()} {shopName}. Tous droits réservés.
                    </p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        {/* Payment Icons Placeholder */}
                        <div className="h-6 w-10 bg-white/10 rounded"></div>
                        <div className="h-6 w-10 bg-white/10 rounded"></div>
                        <div className="h-6 w-10 bg-white/10 rounded"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
