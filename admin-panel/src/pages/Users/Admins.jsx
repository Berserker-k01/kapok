import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiUser, FiMail, FiShield, FiLoader, FiX } from 'react-icons/fi'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuthStore } from '../../store/authStore'

const Admins = () => {
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { user: currentUser } = useAuthStore()

    const fetchAdmins = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/admin/admins')
            setAdmins(response.data.admins)
        } catch (error) {
            console.error('Erreur chargement admins:', error)
            toast.error('Impossible de charger la liste des administrateurs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAdmins()
    }, [])

    const handleCreateAdmin = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await axios.post('/admin/admins', formData)
            toast.success('Nouvel administrateur créé')
            setIsModalOpen(false)
            setFormData({ name: '', email: '', password: '', role: 'admin' })
            fetchAdmins()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la création')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteAdmin = async (adminId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) return

        try {
            await axios.delete(`/admin/admins/${adminId}`)
            toast.success('Administrateur supprimé')
            fetchAdmins()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
        }
    }

    if (currentUser?.role !== 'super_admin') {
        return (
            <div className="p-8 text-center">
                <FiShield className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Accès Restreint</h1>
                <p className="text-gray-500">Seul un Super Administrateur peut gérer les accès administratifs.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Administrateurs</h1>
                    <p className="text-secondary-500 dark:text-secondary-400">Gérez les accès administratifs de la plateforme</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <FiPlus /> Ajouter un Admin
                </Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-secondary-700">
                        <thead className="bg-gray-50 dark:bg-secondary-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Créé le</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Dernière Connexion</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-secondary-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <FiLoader className="w-8 h-8 mx-auto animate-spin text-primary-600" />
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Aucun administrateur trouvé.
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                                                    <FiUser />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{admin.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-secondary-400 flex items-center">
                                                        <FiMail className="mr-1 w-3 h-3" /> {admin.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={admin.role === 'super_admin' ? 'danger' : 'info'}>
                                                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(admin.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Jamais'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {(admin.id !== currentUser.id && admin.id !== 'admin-default') && (
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin.id)}
                                                    className="text-red-600 hover:text-red-900 p-2"
                                                    title="Supprimer l'administrateur"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Création Admin */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-secondary-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleCreateAdmin}>
                                <div className="bg-white dark:bg-secondary-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ajouter un Administrateur</h3>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <FiX className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <Input
                                            label="Nom Complet"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: Jean Admin"
                                        />
                                        <Input
                                            label="Email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="admin@assime.net"
                                        />
                                        <Input
                                            label="Mot de Passe"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">Rôle</label>
                                            <select
                                                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            >
                                                <option value="admin">Administrateur Standard</option>
                                                <option value="super_admin">Super Administrateur</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-secondary-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <Button type="submit" isLoading={isSubmitting} className="w-full sm:ml-3 sm:w-auto">
                                        Créer l'Admin
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mt-3 w-full sm:mt-0 sm:w-auto">
                                        Annuler
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Admins
