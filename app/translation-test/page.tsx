'use client';

import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';

export default function TranslationTestPage() {
  const { t, currentLanguage } = useTranslations();
  const { setLanguage, availableLanguages } = useLanguage();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Translation System Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Language Selector</h2>
        <div className="flex gap-4">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-4 py-2 rounded-lg ${
                currentLanguage === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Current language: {currentLanguage}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Navigation</h3>
          <ul className="space-y-2">
            <li>Dashboard: {t('navigation.dashboard')}</li>
            <li>Clients: {t('navigation.clients')}</li>
            <li>Appointments: {t('navigation.appointments')}</li>
            <li>Settings: {t('navigation.settings')}</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Common</h3>
          <ul className="space-y-2">
            <li>Loading: {t('common.loading')}</li>
            <li>Save: {t('common.save')}</li>
            <li>Cancel: {t('common.cancel')}</li>
            <li>Edit: {t('common.edit')}</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
          <ul className="space-y-2">
            <li>Title: {t('dashboard.welcome.title', { name: 'John' })}</li>
            <li>Total Clients: {t('dashboard.stats.totalClients')}</li>
            <li>Recent Activity: {t('dashboard.recentActivity.title')}</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800">Debug Info</h3>
        <p className="text-sm text-yellow-700">
          This page tests the translation system. Try switching languages above to see translations change.
        </p>
      </div>
    </div>
  );
}