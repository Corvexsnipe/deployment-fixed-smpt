'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface StaffApplication {
  id: number;
  application_id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface CustomerSupportApplication {
  id: number;
  application_id: string;
  full_name: string;
  email: string;
  age: number;
  country: string;
  city: string;
  contact_number: string;
  discord_username: string;
  languages: string;
  previous_experience: string;
  has_hosting_experience: boolean;
  hosting_experience_details: string;
  experience_letter_path: string;
  daily_hours: number;
  weekend_availability: boolean;
  emergency_availability: boolean;
  handle_angry_customer: string;
  handle_unknown_solution: string;
  prioritize_multiple_customers: string;
  explain_technical_issue: string;
  minecraft_server_check: string;
  expected_salary: string;
  identity_card_path: string;
  passport_photo_path: string;
  why_hire: string;
  agree_to_rules: boolean;
  created_at: string;
}

interface SalesApplication {
  id: number;
  application_id: string;
  full_name: string;
  email: string;
  age: number;
  country: string;
  city: string;
  contact_number: string;
  discord_username: string;
  languages: string;
  previous_experience: string;
  hosting_experience: string;
  experience_letter_path: string;
  daily_hours: string;
  weekend_availability: boolean;
  emergency_availability: boolean;
  expected_salary: string;
  convince_customer: string;
  expensive_response: string;
  minecraft_server_info: string;
  ram_cpu_difference: string;
  lag_diagnosis: string;
  identity_card_path: string;
  passport_photo_path: string;
  why_hire: string;
  agree_to_rules: boolean;
  created_at: string;
}

const ADMIN_CREDENTIALS = {
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'killerlandop12@gmail.com',
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Khatne123!!',
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'staff' | 'customer-support' | 'sales'>('staff');
  const [staffApplications, setStaffApplications] = useState<StaffApplication[]>([]);
  const [customerSupportApplications, setCustomerSupportApplications] = useState<CustomerSupportApplication[]>([]);
  const [salesApplications, setSalesApplications] = useState<SalesApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedApplication, setExpandedApplication] = useState<number | null>(null);
  const [modalImage, setModalImage] = useState<{ src: string; title: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStaffApplications();
      fetchCustomerSupportApplications();
      fetchSalesApplications();
    }
  }, [isAuthenticated]);

  const fetchStaffApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/staff-applications');
      if (response.ok) {
        const data = await response.json();
        setStaffApplications(data.applications);
      } else {
        setError('Failed to fetch staff applications');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerSupportApplications = async () => {
    try {
      const response = await fetch('/api/customer-support-applications');
      if (response.ok) {
        const data = await response.json();
        setCustomerSupportApplications(data.applications);
      } else {
        setError('Failed to fetch customer support applications');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const fetchSalesApplications = async () => {
    try {
      const response = await fetch('/api/sales-applications');
      if (response.ok) {
        const data = await response.json();
        setSalesApplications(data.applications);
      } else {
        setError('Failed to fetch sales applications');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await fetch(`/api/staff-applications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStaffApplications(staffApplications.filter((app) => app.id !== id));
      } else {
        setError('Failed to delete application');
      }
    } catch (err) {
      setError('Error deleting application');
    }
  };

  const handleDeleteCustomerSupport = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await fetch(`/api/customer-support-applications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCustomerSupportApplications(customerSupportApplications.filter((app) => app.id !== id));
      } else {
        setError('Failed to delete application');
      }
    } catch (err) {
      setError('Error deleting application');
    }
  };

  const handleDeleteSales = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await fetch(`/api/sales-applications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSalesApplications(salesApplications.filter((app) => app.id !== id));
      } else {
        setError('Failed to delete application');
      }
    } catch (err) {
      setError('Error deleting application');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Admin Login</h1>
            <p className="text-gray-400 text-center mb-8">Enter your credentials to access the admin panel</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your password"
                />
              </div>

              {loginError && (
                <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-center">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400">View and manage applications</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => { fetchStaffApplications(); fetchCustomerSupportApplications(); fetchSalesApplications(); }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'staff' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Staff Applications ({staffApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('customer-support')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'customer-support' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Customer Support Applications ({customerSupportApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'sales' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Sales Applications ({salesApplications.length})
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {activeTab === 'staff' ? (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Loading applications...</p>
              </div>
            ) : staffApplications.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700">
                <p className="text-gray-400 text-lg">No staff applications yet</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {staffApplications.map((application) => (
                  <div
                    key={application.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-cyan-400/30 hover:bg-gray-800/70 transition overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">{application.name}</h3>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-400/10 border border-cyan-400/30 rounded text-xs font-mono text-cyan-400">
                            {application.application_id}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mb-3">{application.email}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-xs">
                          {new Date(application.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedApplication(expandedApplication === application.id ? null : application.id)}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded-lg transition"
                          >
                            {expandedApplication === application.id ? 'Hide' : 'View'}
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(application.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {expandedApplication === application.id && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <div className="bg-gray-900/50 rounded-lg p-3">
                            <p className="text-gray-300 text-xs whitespace-pre-wrap">{application.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'customer-support' ? (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Loading applications...</p>
              </div>
            ) : customerSupportApplications.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700">
                <p className="text-gray-400 text-lg">No customer support applications yet</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {customerSupportApplications.map((application) => (
                  <div
                    key={application.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-cyan-400/30 hover:bg-gray-800/70 transition overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">{application.full_name}</h3>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-green-400/10 border border-green-400/30 rounded text-xs font-mono text-green-400">
                            {application.application_id}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mb-1">{application.email}</p>
                      <p className="text-gray-500 text-xs mb-3">{application.country}, {application.city}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-xs">
                          {new Date(application.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedApplication(expandedApplication === application.id ? null : application.id)}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded-lg transition"
                          >
                            {expandedApplication === application.id ? 'Hide' : 'View'}
                          </button>
                          <button
                            onClick={() => handleDeleteCustomerSupport(application.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {expandedApplication === application.id && (
                        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3 max-h-96 overflow-y-auto">
                          <div className="bg-gray-900/50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-cyan-400 mb-2">Documents</h4>
                            <div className="flex flex-wrap gap-2">
                              {application.identity_card_path && (
                                <button
                                  onClick={() => setModalImage({ src: application.identity_card_path, title: 'Identity Card' })}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                                >
                                  ID Card
                                </button>
                              )}
                              {application.passport_photo_path && (
                                <button
                                  onClick={() => setModalImage({ src: application.passport_photo_path, title: 'Passport Photo' })}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                                >
                                  Photo
                                </button>
                              )}
                              {application.experience_letter_path && (
                                <a
                                  href={application.experience_letter_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition"
                                >
                                  Experience Letter
                                </a>
                              )}
                              {!application.identity_card_path && !application.passport_photo_path && !application.experience_letter_path && (
                                <p className="text-gray-500 text-xs">No documents</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'sales' ? (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Loading applications...</p>
              </div>
            ) : salesApplications.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700">
                <p className="text-gray-400 text-lg">No sales applications yet</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {salesApplications.map((application) => (
                  <div
                    key={application.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-cyan-400/30 hover:bg-gray-800/70 transition overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">{application.full_name}</h3>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-green-400/10 border border-green-400/30 rounded text-xs font-mono text-green-400">
                            {application.application_id}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mb-1">{application.email}</p>
                      <p className="text-gray-500 text-xs mb-3">{application.country}, {application.city}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-xs">
                          {new Date(application.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedApplication(expandedApplication === application.id ? null : application.id)}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded-lg transition"
                          >
                            {expandedApplication === application.id ? 'Hide' : 'View'}
                          </button>
                          <button
                            onClick={() => handleDeleteSales(application.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {expandedApplication === application.id && (
                        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3 max-h-96 overflow-y-auto">
                          <div className="bg-gray-900/50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-cyan-400 mb-2">Documents</h4>
                            <div className="flex flex-wrap gap-2">
                              {application.identity_card_path && (
                                <button
                                  onClick={() => setModalImage({ src: application.identity_card_path, title: 'Identity Card' })}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                                >
                                  ID Card
                                </button>
                              )}
                              {application.passport_photo_path && (
                                <button
                                  onClick={() => setModalImage({ src: application.passport_photo_path, title: 'Passport Photo' })}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                                >
                                  Photo
                                </button>
                              )}
                              {application.experience_letter_path && (
                                <a
                                  href={application.experience_letter_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition"
                                >
                                  Experience Letter
                                </a>
                              )}
                              {!application.identity_card_path && !application.passport_photo_path && !application.experience_letter_path && (
                                <p className="text-gray-500 text-xs">No documents</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{modalImage.title}</h3>
                <a
                  href={modalImage.src}
                  download
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </div>

              <div className="p-4 bg-gray-800">
                <img
                  src={modalImage.src}
                  alt={modalImage.title}
                  className="w-full h-auto max-h-[70vh] object-contain rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
