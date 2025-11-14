import React from "react";
import {
  User,
  Phone,
  Shield,
  Home,
  FileText,
  Building2,
} from "lucide-react";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import type { IProfile } from "../../types/user.types";

interface ViewResidentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: IProfile | null;
}

const ViewResidentDetailsModal: React.FC<ViewResidentDetailsModalProps> = ({
  isOpen,
  onClose,
  resident,
}) => {
  if (!isOpen || !resident) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resident":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "resident":
        return "Resident";
      default:
        return role;
    }
  };

  return (
    <Modal title="Resident Details" isOpen={isOpen} onClose={onClose} size="xl">
      <ModalBody className="space-y-6">
        {/* Header Section */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {resident.full_name}
                </h3>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                      resident.role
                    )}`}
                  >
                    <Shield className="w-4 h-4" />
                    {getRoleLabel(resident.role)}
                  </span>
                  <span className="text-lg font-medium text-gray-600">
                    Unit {resident.unit_number}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">
                <User className="w-4 h-4 inline mr-2" />
                Basic Information
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900 text-lg">
                      {resident.full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium text-gray-900">
                      {getRoleLabel(resident.role)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">
                <Phone className="w-4 h-4 inline mr-2" />
                Contact Information
              </label>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-700">Phone Number</p>
                    <a
                      href={`tel:+91${resident.phone}`}
                      className="font-medium text-blue-900 hover:text-blue-700 text-lg"
                    >
                      +91 {resident.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Record Information */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">
                <FileText className="w-4 h-4 inline mr-2" />
                Record Information
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Created On</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(resident.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(resident.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Unit Information */}
            {(resident.unit_number || resident.square_footage) && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">
                  <Home className="w-4 h-4 inline mr-2" />
                  Unit Information
                </label>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                      <Home className="w-6 h-6 text-green-600" />
                    </div>
                    {resident.unit_number && (
                      <div className="mb-3">
                        <p className="text-sm text-green-700">Unit Number</p>
                        <p className="text-2xl font-bold text-green-800">
                          {resident.unit_number}
                        </p>
                      </div>
                    )}
                    {resident.square_footage && (
                      <div>
                        <p className="text-sm text-green-700">Area</p>
                        <p className="text-lg font-semibold text-green-800">
                          {resident.square_footage} sq ft
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Organization Information */}
            {resident.organization && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Society Information
                </label>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-xs text-indigo-700">Society Name</p>
                        <p className="font-medium text-indigo-900 text-lg">
                          {resident.organization.name}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-700">Organization ID</p>
                      <p className="font-mono text-sm text-indigo-800 bg-indigo-100 rounded px-2 py-1 inline-block">
                        {resident?.organization_id?.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information Card */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center mb-3">
            <FileText className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="text-sm font-medium text-gray-900">
              Additional Information
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-700 font-medium">Resident ID:</span>
              <span className="text-gray-900 ml-2 font-mono text-xs">
                {resident.id.slice(0, 8)}...
              </span>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Role:</span>
              <span className="text-gray-900 ml-2">
                {getRoleLabel(resident.role)}
              </span>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
        >
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewResidentDetailsModal;
