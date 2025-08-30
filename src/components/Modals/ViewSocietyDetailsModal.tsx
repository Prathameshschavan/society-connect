import React from "react";
import {
  Building2,
  Phone,
  MapPin,
  Hash,
  Calendar,
  Users,
  IndianRupee,
  FileText,
} from "lucide-react";
import Modal from "./Modal";
import type { Organization } from "../../libs/stores/useOrganizationStore";

interface ViewSocietyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  society: Organization | null;
}

const ViewSocietyDetailsModal: React.FC<ViewSocietyDetailsModalProps> = ({
  isOpen,
  onClose,
  society,
}) => {
  if (!isOpen || !society) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount || amount === 0) return "Not set";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Modal title="Society Details" isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {society.name}
          </h2>
          {society.registration_number && (
            <p className="text-sm text-gray-500">
              Registration: {society.registration_number}
            </p>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Society Name
                </label>
                <p className="text-gray-900">{society.name}</p>
              </div>
              {society.registration_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Registration Number
                  </label>
                  <p className="text-gray-900">{society.registration_number}</p>
                </div>
              )}
              {society.established_date && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Established Date
                  </label>
                  <p className="text-gray-900">
                    {formatDate(society.established_date)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Location</h3>
            </div>
            <div className="space-y-3">
              {society.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Address
                  </label>
                  <p className="text-gray-900">{society.address}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {society.city && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      City
                    </label>
                    <p className="text-gray-900">{society.city}</p>
                  </div>
                )}
                {society.state && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      State
                    </label>
                    <p className="text-gray-900">{society.state}</p>
                  </div>
                )}
                {society.pincode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Pincode
                    </label>
                    <p className="text-gray-900">{society.pincode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">
                Contact Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {society.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Phone Number
                  </label>
                  <p className="text-gray-900">
                    <a
                      href={`tel:+91${society.phone}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      +91 {society.phone}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">
                Property Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  Total Units
                </label>
                <p className="text-gray-900 font-semibold text-lg">
                  {society.total_units || 0} flats
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <IndianRupee className="w-4 h-4 inline mr-1" />
                  Maintenance Rate
                </label>
                <p className="text-gray-900">
                  {society.maintenance_rate
                    ? `${formatCurrency(society.maintenance_rate)} per sq ft`
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Information */}
          {society.admin && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Administrator</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {society?.admin?.[0]?.full_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Name
                    </label>
                    <p className="text-gray-900">
                      {society?.admin?.[0].full_name}
                    </p>
                  </div>
                )}
                {society?.admin?.[0].phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900">
                      <a
                        href={`tel:+91${society?.admin?.[0].phone}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        +91 {society?.admin?.[0].phone}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">
                Record Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Created On
                </label>
                <p className="text-gray-900">
                  {formatDate(society?.created_at as string)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Society ID
                </label>
                <p className="text-gray-900 font-mono text-sm">{society.id}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default ViewSocietyDetailsModal;
