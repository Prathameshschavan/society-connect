import React from "react";
import { Home, User, Square, Calendar } from "lucide-react";
import Modal from "./Modal";
import type { IUnit } from "../../types/unit.types";

interface ViewUnitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: IUnit | null;
}

const ViewUnitDetailsModal: React.FC<ViewUnitDetailsModalProps> = ({
  isOpen,
  onClose,
  unit,
}) => {
  if (!unit) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Unit Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">View unit information</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Unit Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-gray-600" />
              Unit Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Unit Number</p>
                  <p className="text-base font-medium text-gray-900">
                    {unit.unit_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Type</p>
                  <p className="text-base font-medium text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {unit.unit_type}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Square className="w-4 h-4" />
                  Square Footage
                </p>
                <p className="text-base font-medium text-gray-900">
                  {unit.square_footage} sq ft
                </p>
              </div>
            </div>
          </div>

          {/* Resident Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              Resident Information
            </h3>
            {unit.profile ? (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-base font-medium text-gray-900">
                      {unit.profile.full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-base font-medium text-gray-900">
                      {unit.profile.phone}
                    </p>
                  </div>
                  {unit.profile.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-base font-medium text-gray-900">
                        {unit.profile.email}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Occupancy Type</p>
                    <p className="text-base font-medium text-gray-900">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          unit.profile.is_tenant
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {unit.profile.is_tenant ? "Tenant" : "Owner"}
                      </span>
                    </p>
                  </div>
                </div>
                {unit.profile.family_members && (
                  <div>
                    <p className="text-sm text-gray-500">Family Members</p>
                    <p className="text-base font-medium text-gray-900">
                      Adults: {unit.profile.family_members.adult || 0},
                      Children: {unit.profile.family_members.child || 0}
                    </p>
                  </div>
                )}
                {unit.profile.vehicles && (
                  <div>
                    <p className="text-sm text-gray-500">Vehicles</p>
                    <p className="text-base font-medium text-gray-900">
                      2-Wheeler: {unit.profile.vehicles.twoWheeler || 0},
                      4-Wheeler: {unit.profile.vehicles.fourWheeler || 0}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500 italic">This unit is vacant</p>
              </div>
            )}
          </div>

          {/* Additional Details */}
          {unit.id && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                Additional Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Unit ID</p>
                    <p className="text-base font-mono text-gray-700">
                      {unit.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewUnitDetailsModal;
