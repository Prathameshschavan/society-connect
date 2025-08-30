import React from "react";
import {
  User,
  Phone,
  MapPin,
  Hash,
  Calendar,
  Shield,
  Home,
  FileText,
  Building2,
} from "lucide-react";
import Modal from "./Modal";
import type { Profile } from "../../types/user.types";

interface ViewResidentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Profile | null;
}

const ViewResidentDetailsModal: React.FC<ViewResidentDetailsModalProps> = ({
  isOpen,
  onClose,
  resident,
}) => {
  if (!isOpen || !resident) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'resident':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'resident':
        return 'Resident';
      default:
        return role;
    }
  };

  return (
    <Modal title="Resident Details" isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {resident.full_name}
          </h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(resident.role)}`}>
            <Shield className="w-4 h-4 mr-1" />
            {getRoleLabel(resident.role)}
          </span>
        </div>

        {/* Details Grid */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900">{resident.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Role
                </label>
                <p className="text-gray-900">{getRoleLabel(resident.role)}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-900">
                  <a
                    href={`tel:+91${resident.phone}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    +91 {resident.phone}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Unit Information */}
          {(resident.unit_number || resident.square_footage) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Unit Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resident.unit_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      <Hash className="w-4 h-4 inline mr-1" />
                      Unit Number
                    </label>
                    <p className="text-gray-900 font-semibold text-lg">
                      {resident.unit_number}
                    </p>
                  </div>
                )}
                {resident.square_footage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Square Footage
                    </label>
                    <p className="text-gray-900">
                      {resident.square_footage} sq ft
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Organization Information */}
          {resident.organizations && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Society Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Society Name
                  </label>
                  <p className="text-gray-900">
                    {resident.organizations.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Organization ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm">
                    {resident.organization_id}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Information */}
          {/* <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Security Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Password Status
                </label>
                <div className="flex items-center gap-2">
                  {resident.must_change_password ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Must Change Password
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Password Set
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div> */}

          {/* Record Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Record Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Created On
                </label>
                <p className="text-gray-900">
                  {formatDate(resident.created_at)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Last Updated
                </label>
                <p className="text-gray-900">
                  {formatDate(resident.updated_at)}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Resident ID
                </label>
                <p className="text-gray-900 font-mono text-sm">{resident.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewResidentDetailsModal;
