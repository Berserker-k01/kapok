import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { FiFacebook, FiSave, FiArrowLeft, FiLayout } from 'react-icons/fi'

const shopSettingsSchema = z.object({
    facebookPixelId: z.string().optional(),
    status: z.enum(['active', 'suspended', 'inactive']).default('active'),
    googleAnalyticsId: z.string().optional(),
    theme: z.enum(['minimal', 'bold', 'custom']).default('minimal'),
    themeConfig: z.object({
        colors: z.object({
            primary: z.string().optional(),
            secondary: z.string().optional(),
            background: z.string().optional(),
            text: z.string().optional(),
        }).optional(),
        content: z.object({
            logoUrl: z.string().optional(),
            shopName: z.string().optional(),
        }).optional(),
    }).optional(),
})

const ShopSettings = () => {
    const { shopId } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
        resolver: zodResolver(shopSettingsSchema)
    })

    useEffect(() => {
        const fetchShop = async () => {
            try {
                // Force /api prefix + Log for debugging
                const response = await axios.get(`/api/shops/${shopId}`)
                console.log('Shop Response Headers:', response.headers);

                // Support both structures (User Panel vs Admin Panel style)
                const shop = response.data.shop || response.data?.data?.shop

                if (!shop) {
                    console.error('Shop Fetch Error: Shop object missing in response', response.data);
                    throw new Error(`Impossible de récupérer les informations de la boutique (ID: ${shopId})`)
                }

                const settings = shop.settings || {}

                reset({
                    theme: shop.theme || 'minimal',
                    status: shop.status || 'active',
                    facebookPixelId: settings.facebookPixelId || '',
                    googleAnalyticsId: settings.googleAnalyticsId || '',
                    themeConfig: settings.themeConfig || {
                        colors: {
                            primary: '#000000',
                            secondary: '#ffffff',
                            background: '#ffffff',
                            text: '#000000'
                        },
                        content: {
                            logoUrl: '',
                            shopName: ''
                        }
                    }
                })
            } catch (error) {
                console.error('ShopSettings Load Error:', error)
                const status = error.response?.status || 'Client Error';
                const message = error.response?.data?.error || error.response?.data?.message || error.message;
                toast.error(`Erreur ${status}: ${message}`)
            } finally {
                setLoading(false)
            }
        }
        fetchShop()
    }, [shopId, reset])

    const onSubmit = async (data) => {
        try {
            // Séparer le thème (colonne dédiée) des autres réglages (JSONB settings)
            const { theme, status, logoFile, bannerFile, ...settingsData } = data

            // Nettoyer les données : convertir undefined en null et supprimer les champs vides
            const cleanData = (obj) => {
                if (obj === null || obj === undefined) return null
                if (typeof obj !== 'object') return obj

                const cleaned = {}
                for (const [key, value] of Object.entries(obj)) {
                    if (value === undefined || value === '') {
                        cleaned[key] = null
                    } else if (typeof value === 'object' && !Array.isArray(value)) {
                        cleaned[key] = cleanData(value)
                    } else {
                        cleaned[key] = value
                    }
                }
                return cleaned
            }

            const cleanedSettings = cleanData(settingsData)

            const formData = new FormData();
            formData.append('theme', theme);
            formData.append('status', status); // Send status explicitly
            formData.append('settings', JSON.stringify(cleanedSettings)); // Send cleaned settings as JSON string

            // Append files if they exist (handling FileList from react-hook-form)
            if (logoFile && logoFile.length > 0) {
                formData.append('logo', logoFile[0]);
            }
            if (bannerFile && bannerFile.length > 0) {
                formData.append('banner', bannerFile[0]);
            }

            await axios.put(`/api/shops/${shopId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Paramètres sauvegardés avec succès !')

            // Recharger les données de la boutique pour afficher les changements
            try {
                await fetchShop()
            } catch (reloadError) {
                console.error('Erreur rechargement après save:', reloadError);
                toast.error('Sauvegarde OK, mais erreur lors du rechargement des données.');
            }

        } catch (error) {
            console.error('Erreur sauvegarde:', error)
            const msg = error.response?.data?.error || error.response?.data?.message || 'Impossible de sauvegarder';
            toast.error(`Erreur: ${msg}`)
        }
    }

    if (loading) return <div>Chargement...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/shops')}>
                    <FiArrowLeft className="mr-2" /> Retour
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres de la boutique</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FiLayout className="text-purple-600 w-6 h-6" />
                        <h2 className="text-lg font-semibold">Apparence de la boutique</h2>
                    </div>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Status Toggle */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 text-sm md:text-base">Statut de la boutique</h3>
                                <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">Activez ou désactivez l'accès public à votre boutique.</p>
                            </div>
                            <select
                                {...register('status')}
                                className="input-field w-full md:w-auto md:min-w-[150px] text-sm md:text-base"
                            >
                                <option value="active">🟢 Active</option>
                                <option value="inactive">🔴 Inactive</option>
                                <option value="suspended">🟠 Maintenance</option>
                            </select>
                        </div>

                        {/* Sélection du Thème */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Option Custom */}
                            <label className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${watch('theme') === 'custom' ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" value="custom" {...register('theme')} className="sr-only" />
                                <div className="aspect-video bg-gray-100 border border-gray-200 rounded-lg mb-4 flex items-center justify-center">
                                    <span className="text-2xl">🎨</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">Thème Personnalisé</span>
                                    {watch('theme') === 'custom' && <span className="text-purple-600 text-sm font-medium">Actif</span>}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Entièrement configurable.</p>
                            </label>

                            {/* Option Minimal */}
                            <label className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${watch('theme') === 'minimal' ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" value="minimal" {...register('theme')} className="sr-only" />
                                <div className="aspect-video bg-white border border-gray-100 rounded-lg mb-4 flex flex-col items-center justify-center shadow-sm">
                                    <div className="w-3/4 h-2 bg-gray-100 rounded mb-2"></div>
                                    <div className="grid grid-cols-2 gap-2 w-3/4">
                                        <div className="h-12 bg-gray-100 rounded"></div>
                                        <div className="h-12 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">Thème Minimal</span>
                                    {watch('theme') === 'minimal' && <span className="text-purple-600 text-sm font-medium">Actif</span>}
                                </div>
                            </label>

                            {/* Option Bold */}
                            <label className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${watch('theme') === 'bold' ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" value="bold" {...register('theme')} className="sr-only" />
                                <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-lg mb-4 flex flex-col items-center justify-center shadow-sm">
                                    <div className="w-3/4 h-4 bg-yellow-400 rounded mb-2"></div>
                                    <div className="w-1/2 h-2 bg-zinc-700 rounded"></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">Thème Bold</span>
                                    {watch('theme') === 'bold' && <span className="text-purple-600 text-sm font-medium">Actif</span>}
                                </div>
                            </label>
                        </div>

                        {/* Configuration des Couleurs - Pour TOUS les thèmes */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6 rounded-xl border-2 border-purple-200 space-y-6 overflow-hidden">
                            <div className="flex flex-col gap-2">
                                <h3 className="font-bold text-gray-900 text-base md:text-lg flex items-center gap-2">
                                    🎨 Personnalisation des Couleurs
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                                    Personnalisez les couleurs de votre boutique pour qu'elle corresponde à votre marque
                                </p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                        Couleur Primaire
                                    </label>
                                    <div className="relative pb-6">
                                        <input
                                            type="color"
                                            {...register('themeConfig.colors.primary')}
                                            className="h-10 md:h-12 w-full cursor-pointer rounded-lg border-2 border-gray-300 hover:border-purple-400 transition-colors"
                                        />
                                        <span className="absolute -bottom-1 left-0 text-[10px] md:text-xs text-gray-500 font-mono truncate w-full">
                                            {watch('themeConfig.colors.primary') || '#000000'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                        Couleur Secondaire
                                    </label>
                                    <div className="relative pb-6">
                                        <input
                                            type="color"
                                            {...register('themeConfig.colors.secondary')}
                                            className="h-10 md:h-12 w-full cursor-pointer rounded-lg border-2 border-gray-300 hover:border-purple-400 transition-colors"
                                        />
                                        <span className="absolute -bottom-1 left-0 text-[10px] md:text-xs text-gray-500 font-mono truncate w-full">
                                            {watch('themeConfig.colors.secondary') || '#ffffff'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                        Couleur de Fond
                                    </label>
                                    <div className="relative pb-6">
                                        <input
                                            type="color"
                                            {...register('themeConfig.colors.background')}
                                            className="h-10 md:h-12 w-full cursor-pointer rounded-lg border-2 border-gray-300 hover:border-purple-400 transition-colors"
                                        />
                                        <span className="absolute -bottom-1 left-0 text-[10px] md:text-xs text-gray-500 font-mono truncate w-full">
                                            {watch('themeConfig.colors.background') || '#ffffff'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                        Couleur du Texte
                                    </label>
                                    <div className="relative pb-6">
                                        <input
                                            type="color"
                                            {...register('themeConfig.colors.text')}
                                            className="h-10 md:h-12 w-full cursor-pointer rounded-lg border-2 border-gray-300 hover:border-purple-400 transition-colors"
                                        />
                                        <span className="absolute -bottom-1 left-0 text-[10px] md:text-xs text-gray-500 font-mono truncate w-full">
                                            {watch('themeConfig.colors.text') || '#000000'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-6 p-4 md:p-6 rounded-xl border-2 border-dashed border-gray-300"
                                style={{
                                    backgroundColor: watch('themeConfig.colors.background') || '#ffffff',
                                    color: watch('themeConfig.colors.text') || '#000000'
                                }}>
                                <h4 className="font-bold text-base md:text-lg mb-2">Aperçu</h4>
                                <p className="mb-4 text-sm md:text-base">Voici à quoi ressemblera votre boutique avec ces couleurs.</p>
                                <button
                                    type="button"
                                    className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold transition-transform hover:scale-105 text-sm md:text-base"
                                    style={{
                                        backgroundColor: watch('themeConfig.colors.primary') || '#000000',
                                        color: watch('themeConfig.colors.secondary') || '#ffffff'
                                    }}
                                >
                                    Bouton Exemple
                                </button>
                            </div>
                        </div>

                        {/* Configuration Avancée - Seulement pour thème Custom */}
                        {watch('theme') === 'custom' && (
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6 animate-in fade-in slide-in-from-top-4">
                                <h3 className="font-semibold text-gray-900 border-b pb-2">Configuration Avancée (Thème Custom)</h3>

                                <div className="space-y-4">
                                    {/* Inputs File au lieu de TEXT URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            {...register('logoFile')}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        />
                                        {watch('themeConfig.content.logoUrl') && <p className="text-xs text-green-600 mt-1">Logo actuel: Chargé</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bannière (Grand Format)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            {...register('bannerFile')}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        />
                                        {watch('themeConfig.content.bannerUrl') && <p className="text-xs text-green-600 mt-1">Bannière actuelle: Chargée</p>}
                                    </div>

                                    <Input
                                        label="Nom de la Boutique (si pas de logo)"
                                        placeholder="Ma Super Boutique"
                                        {...register('themeConfig.content.shopName')}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiFacebook className="text-blue-600" />
                                Marketing & Tracking
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        label="ID Pixel Facebook"
                                        placeholder="Ex: 123456789012345"
                                        {...register('facebookPixelId')}
                                        error={errors.facebookPixelId?.message}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Permet de tracker les conversions, créer des audiences et optimiser vos publicités Facebook.
                                        Trouvez votre ID dans les Paramètres de votre Pixel Facebook.
                                    </p>
                                </div>
                                <div>
                                    <Input
                                        label="ID Google Analytics (G-XXXXX)"
                                        placeholder="Ex: G-ABC123DEF"
                                        {...register('googleAnalyticsId')}
                                        error={errors.googleAnalyticsId?.message}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Suivez le trafic et les performances de votre boutique avec Google Analytics.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={isSubmitting} className="flex items-center">
                                <FiSave className="mr-2" />
                                Sauvegarder les paramètres
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    )
}

export default ShopSettings
