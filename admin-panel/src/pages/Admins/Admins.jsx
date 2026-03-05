import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiLoader, FiX, FiShield, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'

const ROLES = [
    { value: 'admin', label: 'Administrateur', description: 'Gestion des utilisateurs et boutiques', color: 'info' },
    { value: 'super_admin', label: 'Super Administrateur', description: 'Accès complet à la plateforme', color: 'danger' },
]

const RoleBadge = ({ role }) => {
    const r = ROLES.find(r => r.value === role)
    return <Badge variant={r?.color || 'info'}>{r?.label || role}</Badge>
}

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-secondary-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors">
                    <FiX className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
)

const Admins = () => {
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingAdmin, setEditingAdmin] = useState(null) // null = création, object = édition
    const [showPassword, setShowPassword] = useState(false)
    const [saving, setSaving] = useState(false)
    const { user: currentUser } = useAuthStore()

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
    })

    const fetchAdmins = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/admin/admins')
            setAdmins(res.data.admins)
        } catch (err) {
            toast.error('Impossible de charger les administrateurs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAdmins() }, [])

    const openCreate = () => {
        setEditingAdmin(null)
        setForm({ name: '', email: '', password: '', role: 'admin' })
        setShowPassword(false)
        setShowModal(true)
    }

    const openEdit = (admin) => {
        setEditingAdmin(admin)
        setForm({ name: admin.name, email: admin.email, password: '', role: admin.role })
        setShowPassword(false)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!editingAdmin && form.password.length < 6) {
            toast.error('Le mot de passe doit faire au moins 6 caractères')
            return
        }
        setSaving(true)
        try {
            if (editingAdmin) {
                await axios.put(`/admin/admins/${editingAdmin.id}`, form)
                toast.success('Administrateur mis à jour')
            } else {
                await axios.post('/admin/admins', form)
                toast.success('Administrateur créé avec succès')
            }
            setShowModal(false)
            fetchAdmins()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erreur lors de l\'opération')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (admin) => {
        if (admin.id === currentUser?.id) {
            toast.error('Vous ne pouvez pas supprimer votre propre compte')
            return
        }
        if (!window.confirm(`Supprimer l'administrateur "${admin.name}" ? Cette action est irréversible.`)) return
        try {
            await axios.delete(`/admin/admins/${admin.id}`)
            toast.success('Administrateur supprimé')
            fetchAdmins()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erreur lors de la suppression')
        }
    }

    const isSuperAdmin = currentUser?.role === 'super_admin'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Administrateurs</h1>
                    <p className="text-secondary-500 dark:text-secondary-400">Gérez les comptes administrateurs et leurs rôles</p>
                </div>
                {isSuperAdmin && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        Nouvel Admin
                    </button>
                )}
            </div>

            {/* Rôles disponibles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLES.map(role => (
                    <Card key={role.value}>
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${role.value === 'super_admin' ? 'bg-red-100' : 'bg-blue-100'}`}>
                                <FiShield className={`w-5 h-5 ${role.value === 'super_admin' ? 'text-red-600' : 'text-blue-600'}`} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{role.label}</p>
                                <p className="text-xs text-gray-500 dark:text-secondary-400 mt-0.5">{role.description}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Liste des admins */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-secondary-700">
                        <thead className="bg-gray-50 dark:bg-secondary-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administrateur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière connexion</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                {isSuperAdmin && (
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-secondary-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <FiLoader className="w-8 h-8 mx-auto animate-spin text-red-600" />
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Aucun administrateur trouvé.</td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className={`hover:bg-gray-50 dark:hover:bg-secondary-700/50 transition-colors ${admin.id === currentUser?.id ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center font-bold text-red-600">
                                                    {admin.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                                                        {admin.name}
                                                        {admin.id === currentUser?.id && (
                                                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Vous</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <FiMail className="w-3 h-3" /> {admin.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RoleBadge role={admin.role} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {admin.last_login ? new Date(admin.last_login).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Jamais'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={admin.status === 'active' ? 'success' : 'danger'}>{admin.status}</Badge>
                                        </td>
                                        {isSuperAdmin && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(admin)}
                                                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    {admin.id !== currentUser?.id && (
                                                        <button
                                                            onClick={() => handleDelete(admin)}
                                                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Créer / Modifier */}
            {showModal && (
                <Modal
                    title={editingAdmin ? `Modifier ${editingAdmin.name}` : 'Nouvel administrateur'}
                    onClose={() => setShowModal(false)}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nom */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-1">Nom complet</label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-secondary-700 text-gray-900 dark:text-white text-sm"
                                    placeholder="Prénom Nom"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-1">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-secondary-700 text-gray-900 dark:text-white text-sm"
                                    placeholder="admin@assime.com"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-1">
                                Mot de passe {editingAdmin && <span className="text-gray-400 font-normal">(laisser vide pour ne pas changer)</span>}
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required={!editingAdmin}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-secondary-700 text-gray-900 dark:text-white text-sm"
                                    placeholder={editingAdmin ? '••••••••' : 'Minimum 6 caractères'}
                                    minLength={editingAdmin ? 0 : 6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Rôle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-1">Rôle</label>
                            <div className="grid grid-cols-2 gap-3">
                                {ROLES.map(role => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, role: role.value })}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === role.value
                                            ? role.value === 'super_admin' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <p className="font-semibold text-sm text-gray-900">{role.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Boutons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : null}
                                {editingAdmin ? 'Enregistrer' : 'Créer l\'admin'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}

export default Admins
