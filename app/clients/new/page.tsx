'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ArrowLeft, 
  Save, 
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';
import { useTranslations } from '../../hooks/useTranslations';

export default function NewClientPage() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Visa Information
    passportNumber: '',
    passportCountry: '',
    visaType: '',
    visaApplicationDate: '',
    visaExpirationDate: '',
    specialRequirements: '',
    currentApplications: '',
    travelHistory: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: ''
  });

  const [activeSection, setActiveSection] = useState('personal');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate required fields: name, email, birthdate, phone, gender, and visa-related fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth || !formData.phone || !formData.gender || !formData.passportNumber || !formData.passportCountry || !formData.visaType || !formData.visaApplicationDate) {
      alert('Please fill in all required fields: First Name, Last Name, Email, Date of Birth, Phone, Gender, Passport Number, Passport Country, Visa Type, and Visa Application Date.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Prepare the data for the API
      const addressParts = [formData.address, formData.city, formData.state, formData.zipCode].filter(Boolean);
      const addressString = addressParts.length > 0 ? addressParts.join(', ') : undefined;
      
      const clientData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        passportNumber: formData.passportNumber,
        passportCountry: formData.passportCountry,
        visaType: formData.visaType,
        visaApplicationDate: formData.visaApplicationDate,
        visaExpirationDate: formData.visaExpirationDate,
        specialRequirements: formData.specialRequirements ? [formData.specialRequirements] : [],
        currentApplications: formData.currentApplications ? [formData.currentApplications] : [],
        travelHistory: formData.travelHistory ? [formData.travelHistory] : [],
      };
      if (addressString) {
        clientData.address = addressString;
      }
      if (formData.emergencyName || formData.emergencyPhone || formData.emergencyRelationship) {
        clientData.emergencyContact = {};
        if (formData.emergencyName) {
          clientData.emergencyContact.name = formData.emergencyName;
        }
        if (formData.emergencyPhone) {
          clientData.emergencyContact.phone = formData.emergencyPhone;
        }
        if (formData.emergencyRelationship) {
          clientData.emergencyContact.relationship = formData.emergencyRelationship;
        }
      }

      // Debug: Log the data being sent
      console.log('Form data being sent:', clientData);
      console.log('Emergency contact data:', clientData.emergencyContact);

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        alert(t('clients.newClient.success.clientAdded'));
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          passportNumber: '',
          passportCountry: '',
          visaType: '',
          visaApplicationDate: '',
          visaExpirationDate: '',
          specialRequirements: '',
          currentApplications: '',
          travelHistory: '',
          emergencyName: '',
          emergencyPhone: '',
          emergencyRelationship: ''
        });
        setActiveSection('personal');
        // Redirect to clients list
        window.location.href = '/clients';
      } else {
        // Attempt to parse JSON error response, fallback to text if not valid JSON
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // If response is not JSON, get text response
          const errorText = await response.text();
          errorData = { error: errorText };
        }
        const errorMessage = errorData.details || errorData.error || 'Unknown error';
        console.error('Error response:', errorData);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert(t('clients.newClient.errors.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'personal', label: t('clients.newClient.sections.personal'), icon: Users },
    { id: 'visa', label: t('clients.newClient.sections.visa'), icon: FileText },
    { id: 'emergency', label: t('clients.newClient.sections.emergency'), icon: Phone }
  ];

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={t('clients.newClient.title')}
        description={t('clients.newClient.description')}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/clients"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('clients.newClient.backToClients')}</span>
            </Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Navigation */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Information Section */}
          {activeSection === 'personal' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                {t('clients.newClient.sections.personal')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.firstName')} *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.lastName')} *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.dateOfBirth')} *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.gender')} *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('clients.newClient.fields.genderOptions.select')}</option>
                    <option value="male">{t('clients.newClient.fields.genderOptions.male')}</option>
                    <option value="female">{t('clients.newClient.fields.genderOptions.female')}</option>
                    <option value="other">{t('clients.newClient.fields.genderOptions.other')}</option>
                    <option value="prefer-not-to-say">{t('clients.newClient.fields.genderOptions.preferNotToSay')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.email')} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.phone')} *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.address')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.city')}
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.state')}
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.zipCode')}
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Visa Information Section */}
          {activeSection === 'visa' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                {t('clients.newClient.sections.visa')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.passportNumber')}
                  </label>
                  <input
                    type="text"
                    id="passportNumber"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="passportCountry" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.passportCountry')}
                  </label>
                  <input
                    type="text"
                    id="passportCountry"
                    name="passportCountry"
                    value={formData.passportCountry}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="visaType" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.visaType')}
                  </label>
                  <input
                    type="text"
                    id="visaType"
                    name="visaType"
                    value={formData.visaType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="visaApplicationDate" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.visaApplicationDate')}
                  </label>
                  <input
                    type="date"
                    id="visaApplicationDate"
                    name="visaApplicationDate"
                    value={formData.visaApplicationDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="visaExpirationDate" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.visaExpirationDate')}
                  </label>
                  <input
                    type="date"
                    id="visaExpirationDate"
                    name="visaExpirationDate"
                    value={formData.visaExpirationDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.allergies')}
                  </label>
                  <input
                    type="text"
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder={t('clients.newClient.placeholders.specialRequirements')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="currentApplications" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.currentApplications')}
                  </label>
                  <textarea
                    id="currentApplications"
                    name="currentApplications"
                    rows={3}
                    value={formData.currentApplications}
                    onChange={handleInputChange}
                    placeholder={t('clients.newClient.placeholders.applications')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="travelHistory" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.travelHistory')}
                  </label>
                  <textarea
                    id="travelHistory"
                    name="travelHistory"
                    rows={4}
                    value={formData.travelHistory}
                    onChange={handleInputChange}
                    placeholder={t('clients.newClient.placeholders.travelHistory')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Section */}
          {activeSection === 'emergency' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 text-red-600 mr-2" />
                {t('clients.newClient.sections.emergency')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.emergencyName')}
                  </label>
                  <input
                    type="text"
                    id="emergencyName"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.emergencyPhone')}
                  </label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyRelationship" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('clients.newClient.fields.emergencyRelationship')}
                  </label>
                  <input
                    type="text"
                    id="emergencyRelationship"
                    name="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={handleInputChange}
                    placeholder={t('clients.newClient.placeholders.emergencyRelationship')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}


          {/* Form Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {index + 1}. {section.label}
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <Link
                href="/clients"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('clients.newClient.buttons.cancel')}
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSubmitting ? t('clients.newClient.buttons.saving') : t('clients.newClient.buttons.saveClient')}</span>
              </button>
            </div>
          </div>
        </form>
      </SidebarLayout>
    </ProtectedRoute>
  );
}