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
                const response = await axios.get(`/shops/${shopId}`)
                const shop = response.data.data.shop
                const settings = shop.settings || {}

                reset({
                    theme: shop.theme || 'minimal',
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
                console.error(error)
                toast.error("Impossible de charger les paramètres")
            } finally {
                setLoading(false)
            }
        }
        fetchShop()
    }, [shopId, reset])

    const onSubmit = async (data) => {
        try {
            // Séparer le thème (colonne dédiée) des autres réglages (JSONB settings)
            const { theme, logoFile, bannerFile, ...settingsData } = data

            const formData = new FormData();
            formData.append('theme', theme);
            formData.append('settings', JSON.stringify(settingsData)); // Send settings as JSON string

            // Append files if they exist (handling FileList from react-hook-form)
            if (logoFile && logoFile.length > 0) {
                formData.append('logo', logoFile[0]);
            }
            if (bannerFile && bannerFile.length > 0) {
                formData.append('banner', bannerFile[0]);
            }

            await axios.put(`/shops/${shopId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Paramètres sauvegardés !')
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de la sauvegarde")
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

                        {/* Configuration du Thème Personnalisé */}
                        {watch('theme') === 'custom' && (
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6 animate-in fade-in slide-in-from-top-4">
                                <h3 className="font-semibold text-gray-900 border-b pb-2">Personnalisation</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Couleur Primaire"
                                        type="color"
                                        {...register('themeConfig.colors.primary')}
                                        className="h-12 w-full cursor-pointer"
                                    />
                                    <Input
                                        label="Couleur Secondaire"
                                        type="color"
                                        {...register('themeConfig.colors.secondary')}
                                        className="h-12 w-full cursor-pointer"
                                    />
                                    <Input
                                        label="Couleur de Fond"
                                        type="color"
                                        {...register('themeConfig.colors.background')}
                                        className="h-12 w-full cursor-pointer"
                                    />
                                    <Input
                                        label="Couleur du Texte"
                                        type="color"
                                        {...register('themeConfig.colors.text')}
                                        className="h-12 w-full cursor-pointer"
                                    />
                                </div>

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
