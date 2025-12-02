import React, { useEffect, useState } from "react";
import { Building2, Phone, MapPin, Hash, Users, FileText } from "lucide-react";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import type { IOrganization } from "../../types/organization.types";
import useOrganizationApiService from "../../hooks/apiHooks/useOrganizationApiService";
import { formatDate } from "../../utility/dateTimeServices";

interface ViewSocietyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

const ViewSocietyDetailsModal: React.FC<ViewSocietyDetailsModalProps> = ({
  isOpen,
  onClose,
  orgId,
}) => {
  const { handleGetOrganization } = useOrganizationApiService();

  const [data, setData] = useState<IOrganization | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !orgId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    handleGetOrganization(orgId)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [orgId, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal title="Society Details" isOpen={isOpen} onClose={onClose} size="xl">
      <ModalBody className="space-y-6">
        {loading && <SocietySkeleton />}

        {!loading && !data && (
          <p className="text-center text-gray-500">No data found.</p>
        )}

        {!loading && data && (
          <>
            {/* Header Section (aligned with ViewResidentDetailsModal) */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full">
                    <Building2 className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {data.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      {data.registration_number && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border bg-gray-100 text-gray-800 border-gray-200">
                          <Hash className="w-4 h-4" />
                          Reg: {data.registration_number}
                        </span>
                      )}
                      {data.total_units && (
                        <span className="text-base font-medium text-gray-600 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {data.total_units} units
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid (same pattern: 2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-3">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Basic Information
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 lg:min-h-[150px]">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Society Name</p>
                        <p className="font-medium text-gray-900 text-base">
                          {data.name}
                        </p>
                      </div>
                      {data.established_date && (
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-xs text-gray-500">
                              Established On
                            </p>
                            <p className="font-medium text-gray-900 text-base">
                              {formatDate(data.established_date)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-3">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Contact Information
                  </label>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 lg:min-h-[150px]">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs text-blue-700">Phone Number</p>
                        {data.phone ? (
                          <a
                            href={`tel:+91${data.phone}`}
                            className="font-medium text-blue-900 hover:text-blue-700 text-base"
                          >
                            +91 {data.phone}
                          </a>
                        ) : (
                          <p className="font-medium text-blue-900 text-base">
                            Not available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Record Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-3">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Record Information
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 lg:min-h-[150px]">
                    <div className="space-y-3">
                      {data.created_at && (
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Created On</p>
                            <p className="font-medium text-gray-900 text-base">
                              {formatDate(data.created_at as string)}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Society ID</p>
                          <p className="font-mono text-base text-gray-900 bg-gray-100 rounded px-2 py-1 inline-block">
                            {data.id?.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Location Information */}
                {(data.address_line_1 ||
                  data.address_line_2 ||
                  data.city ||
                  data.state ||
                  data.pincode) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Location
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 lg:min-h-[150px]">
                      <div className="space-y-3">
                        {data.address_line_1 && (
                          <div>
                            <p className="text-xs text-gray-500">
                              Address line 1
                            </p>
                            <p className="font-medium text-gray-900 text-base">
                              {data.address_line_1}
                            </p>
                          </div>
                        )}
                        {data.address_line_2 && (
                          <div>
                            <p className="text-xs text-gray-500">
                              Address line 2
                            </p>
                            <p className="font-medium text-gray-900 text-base">
                              {data.address_line_2}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          {data.city && (
                            <div>
                              <p className="text-xs text-gray-500">City</p>
                              <p className="font-medium text-gray-900 text-base">
                                {data.city}
                              </p>
                            </div>
                          )}
                          {data.state && (
                            <div>
                              <p className="text-xs text-gray-500">State</p>
                              <p className="font-medium text-gray-900 text-base">
                                {data.state}
                              </p>
                            </div>
                          )}
                          {data.pincode && (
                            <div>
                              <p className="text-xs text-gray-500">Pincode</p>
                              <p className="font-medium text-gray-900 text-base">
                                {data.pincode}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Property Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-3">
                    <Hash className="w-4 h-4 inline mr-2" />
                    Property Information
                  </label>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200 lg:min-h-[150px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-green-700">Total Units</p>
                        <p className="font-bold text-green-800 text-base">
                          {data.total_units || 0}
                        </p>
                      </div>
                      <div className="hidden  sm:block"></div>

                      <div>
                        <p className="text-xs text-green-700">Maintenance</p>
                        <p className="text-base font-semibold text-green-800">
                          <Maintenance
                            type={data?.calculate_maintenance_by as string}
                            amount={data.maintenance_amount}
                            rate={data.maintenance_rate}
                          />
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-green-700">
                          Tenant Maintenance
                        </p>
                        <p className="text-base font-semibold text-green-800">
                          <Maintenance
                            type={data?.calculate_maintenance_by as string}
                            amount={data.tenant_maintenance_amount as number}
                            rate={data.tenant_maintenance_rate as number}
                          />
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-green-700">
                          Calculate Maintenance of
                        </p>
                        <p className="text-base font-semibold text-green-800">
                          {data.is_prev ? "Previous Month" : "Current Month"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Information */}
                {(data.admins?.length ?? 0) > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-3">
                      <Users className="w-4 h-4 inline mr-2" />
                      Administrators
                    </label>
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 lg:min-h-[150px]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.admins?.[0]?.full_name && (
                          <div>
                            <p className="text-xs text-indigo-700">Name</p>
                            <p className="font-medium text-indigo-900 text-base">
                              {data.admins[0].full_name}
                            </p>
                          </div>
                        )}
                        {data.admins?.[0]?.phone && (
                          <div>
                            <p className="text-xs text-indigo-700">Phone</p>
                            <p className="font-medium text-indigo-900">
                              <a
                                href={`tel:+91${data.admins[0].phone}`}
                                className="text-indigo-900 hover:text-indigo-700 text-base"
                              >
                                {data.admins[0].phone}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
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

const Maintenance: React.FC<{
  type: string;
  rate: number;
  amount: number;
}> = ({ amount, rate, type }) => {
  if (type == "fixed") {
    if (amount) {
      return `₹${amount} per month`;
    } else {
      return "Not set";
    }
  } else {
    if (rate) {
      return `₹${rate} per month`;
    } else {
      return "Not set";
    }
  }
};

export default ViewSocietyDetailsModal;

// Same shimmer tone as before, reused
const SocietySkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="border-b border-gray-200 pb-4">
      <div className="flex items-start gap-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-40" />
          <div className="flex gap-3">
            <div className="h-7 bg-gray-200 rounded-full w-32" />
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((col) => (
        <div key={col} className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
