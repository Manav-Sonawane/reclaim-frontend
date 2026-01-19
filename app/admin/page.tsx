'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Trash2, Shield, Search, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({ totalUsers: 0, totalItems: 0, lostItems: 0, foundItems: 0 });
  const [activeTab, setActiveTab] = useState<'users' | 'items'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'deleteUser' as 'deleteUser' | 'deleteItem' | 'promote' | 'demote' | 'removeAdmin',
    id: '',
    name: ''
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        router.push('/dashboard');
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, itemsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/items')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (type: typeof confirmModal.type, id: string, name: string = '') => {
    setConfirmModal({ isOpen: true, type, id, name });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const executeAction = async () => {
    const { type, id } = confirmModal;
    
    try {
      if (type === 'deleteUser') {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        toast.success('User deleted');
      } else if (type === 'deleteItem') {
        await api.delete(`/admin/items/${id}`);
        setItems(items.filter(i => i._id !== id));
        toast.success('Item deleted');
      } else if (type === 'promote') {
        await api.put(`/admin/users/${id}/role`, { role: 'admin' });
        setUsers(users.map(u => u._id === id ? { ...u, role: 'admin' } : u));
        toast.success('User promoted to Admin');
      } else if (type === 'demote' || type === 'removeAdmin') {
        await api.put(`/admin/users/${id}/role`, { role: 'user' });
        setUsers(users.map(u => u._id === id ? { ...u, role: 'user' } : u));
        toast.success('Admin privileges removed');
      }
      fetchData(); // Refresh all data to be safe
      closeConfirmModal();
    } catch (error) {
      toast.error('Action failed');
      closeConfirmModal();
    }
  };

  if (authLoading || loading) {
    return <div className="p-8 text-center">Loading admin dashboard...</div>;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Lost Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.lostItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Found Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.foundItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 text-sm font-medium ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-6 py-4 text-sm font-medium ${activeTab === 'items' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Manage Items
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-800">
                    <th className="pb-3 bg-white dark:bg-gray-900">Name</th>
                    <th className="pb-3 bg-white dark:bg-gray-900">Email</th>
                    <th className="pb-3 bg-white dark:bg-gray-900">Role</th>
                    <th className="pb-3 bg-white dark:bg-gray-900">Joined</th>
                    <th className="pb-3 bg-white dark:bg-gray-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 font-medium">{u.name}</td>
                      <td className="py-3 text-gray-500">{u.email}</td>
                      <td className="py-3">
                         <span className={`px-2 py-1 rounded-full text-xs 
                            ${u.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 
                              u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                          {u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                           {u._id !== user._id && u.role !== 'super_admin' && (
                               <>
                                {user.role === 'super_admin' && (
                                    u.role === 'admin' ? (
                                        <Button variant="outline" size="sm" onClick={() => openConfirmModal('demote', u._id, u.name)} className="text-orange-600 hover:bg-orange-50 border-orange-200">
                                            <Shield className="w-4 h-4 mr-1" />
                                            Demote
                                        </Button>
                                    ) : (
                                        <Button variant="outline" size="sm" onClick={() => openConfirmModal('promote', u._id, u.name)} className="text-blue-600 hover:bg-blue-50 border-blue-200">
                                            <Shield className="w-4 h-4 mr-1" />
                                            Promote
                                        </Button>
                                    )
                                )}
                                <Button variant="outline" size="sm" onClick={() => openConfirmModal('deleteUser', u._id, u.name)} className="text-red-500 hover:bg-red-50 border-red-200">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                               </>
                           )}
                           {u._id === user._id && (
                               <span className="text-xs text-gray-400 italic mr-2">It's You</span>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-800">
                    <th className="pb-3 bg-white dark:bg-gray-900">Image</th>
                    <th className="pb-3 bg-white dark:bg-gray-900">Title</th>
                    <th className="pb-3 bg-white dark:bg-gray-900">Type</th>
                    <th className="pb-3 bg-white dark:bg-gray-900">Posted By</th>
                    <th className="pb-3 bg-white dark:bg-gray-900">Date</th>
                    <th className="pb-3 bg-white dark:bg-gray-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3">
                         {item.images && item.images[0] ? (
                             <img src={item.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                         ) : (
                             <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">?</div>
                         )}
                      </td>
                      <td className="py-3 font-medium">{item.title}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{item.user?.name || 'Unknown'}</td>
                      <td className="py-3 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => openConfirmModal('deleteItem', item._id, item.title)} className="text-red-500 hover:bg-red-50 border-red-200">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

       {/* Confirmation Modal */}
       <Modal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        title={
            confirmModal.type === 'deleteUser' ? 'Delete User' :
            confirmModal.type === 'deleteItem' ? 'Delete Item' :
            confirmModal.type === 'promote' ? 'Promote User' :
            'Demote Admin'
        }
      >
        <div className="space-y-4">
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <p className="text-sm font-medium">
                    {confirmModal.type === 'deleteUser' && "Warning: This action cannot be undone. All items posted by this user will also be deleted."}
                    {confirmModal.type === 'deleteItem' && "Warning: This action cannot be undone."}
                    {(confirmModal.type === 'promote' || confirmModal.type === 'demote') && "This will change the user's access privileges immediately."}
                </p>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to 
                {confirmModal.type === 'deleteUser' && <span> delete user <strong>{confirmModal.name}</strong>?</span>}
                {confirmModal.type === 'deleteItem' && <span> delete item <strong>{confirmModal.name}</strong>?</span>}
                {confirmModal.type === 'promote' && <span> promote <strong>{confirmModal.name}</strong> to Admin?</span>}
                {(confirmModal.type === 'demote' || confirmModal.type === 'removeAdmin') && <span> remove admin privileges from <strong>{confirmModal.name}</strong>?</span>}
            </p>

            <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={closeConfirmModal}>Cancel</Button>
                <Button 
                    variant={confirmModal.type.startsWith('delete') || confirmModal.type === 'demote' ? 'danger' : 'primary'}
                    onClick={executeAction}
                >
                    Confirm
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
