import {
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  Home,
  Phone,
  Receipt,
  User,
} from "lucide-react";
import Modal from "./Modal";
import type React from "react";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";
import useCommonService from "../../hooks/serviceHooks/useCommonService";

interface ViewMaintananceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
  residentInfo?: boolean;
}

import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import {
  useOrganizationStore,
  type ExtraItem,
} from "../../libs/stores/useOrganizationStore";
import { useMemo } from "react";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, color: "#1f2937" },
  orgHeader: { alignItems: "center", marginBottom: 12 },
  orgName: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  orgAddress: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 3,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 10, marginTop: 5 },
  chipBase: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 10,
    alignSelf: "flex-start",
  },
  chipGreen: { backgroundColor: "#dcfce7", color: "#166534" },
  chipYellow: { backgroundColor: "#fef9c3", color: "#854d0e" },
  chipRed: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  chipGray: { backgroundColor: "#e5e7eb", color: "#374151" },
  section: { marginTop: 8, marginBottom: 10 },
  twoCol: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  label: { color: "#6b7280" },
  value: { marginTop: 2 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 12 },
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  thead: { backgroundColor: "#f3f4f6", flexDirection: "row" },
  th: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, fontSize: 10 },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  td: { flex: 1, paddingVertical: 6, paddingHorizontal: 8 },
  right: { textAlign: "right" },
  totalsBox: {
    marginTop: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalsHead: { backgroundColor: "#f9fafb", borderTopWidth: 0 },
  totalsLabel: { color: "#374151" },
  totalsValue: { fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 10,
  },
});

const chipStyleFor = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return [styles.chipBase, styles.chipGreen];
    case "pending":
      return [styles.chipBase, styles.chipYellow];
    case "overdue":
      return [styles.chipBase, styles.chipRed];
    default:
      return [styles.chipBase, styles.chipGray];
  }
};

const monthName = (mm: string) =>
  ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"][
    Number(mm) - 1
  ]
    ? new Date(2000, Number(mm) - 1, 1).toLocaleString("en-US", {
        month: "long",
      })
    : mm;

export function BillPdf({
  bill,
  extras,
}: {
  bill: MaintenanceBill;
  extras: ExtraItem[];
}) {
  console.log(extras, bill);
  const { profile } = useProfileStore();
  const { residentOrganization } = useOrganizationStore();
  const { longMonth } = useCommonService();

  // Prefer array-based extras from breakdown; ignore legacy numeric fields

  const extrasTotal = extras.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const monthLabel = `${monthName(bill.bill_month)} ${bill.bill_year}`;
  const dueDate = bill.due_date
    ? new Date(bill.due_date).toLocaleDateString("en-IN")
    : "-";

  // Build table rows
  const rows: Array<{
    desc: string;
    amount: number;
    penalty?: number;
    subtotal?: number;
  }> = [];

  const subTotal = useMemo(() => {
    return (
      (bill.breakdown?.base ?? 0) +
      bill.breakdown?.dues?.reduce(
        (acc, curr) => acc + (curr?.amount + curr?.penalty),
        0
      )
    );
  }, [bill]);

  // Current month base
  rows.push({
    desc: `Base charge (${monthLabel})`,
    amount: bill.breakdown?.base ?? 0,
  });

  // Previous dues (unchanged)
  (bill.breakdown?.dues || []).forEach((d) => {
    const label = `Due ${monthName(d.month)} ${d.year}`;
    rows.push({
      desc: `${label}${d.penalty ? " + Penalty" : ""}`,
      amount: d.amount,
      penalty: d.penalty || 0,
      subtotal: d.amount + (d.penalty || 0),
    });
  });

  // Totals
  const baseTotal = bill.breakdown?.base ?? 0;
  const duesPenaltyTotal = (bill.breakdown?.dues || []).reduce(
    (sum, d) => sum + (d.amount || 0) + (d.penalty || 0),
    0
  );
  const computedGrand = baseTotal + duesPenaltyTotal;
  const grandTotal =
    typeof bill.amount === "number" ? bill.amount : computedGrand;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.orgHeader}>
          <Text style={styles.orgName}>{residentOrganization?.name}</Text>
          {residentOrganization?.address ? (
            <Text style={styles.orgAddress}>
              {[
                residentOrganization?.address,
                residentOrganization?.city,
                residentOrganization?.state,
                residentOrganization?.pincode,
              ]
                .filter((val) => val)
                .join(", ")}
            </Text>
          ) : null}
        </View>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.col}>
            <Text style={styles.label}>Receipt No</Text>
            <Text style={styles.title}>#{bill.id}</Text>
          </View>
          <Text style={chipStyleFor(bill?.status as string)}>
            {(bill.status || "").toUpperCase()}
          </Text>
        </View>

        {/* Bill to / Info */}
        <View style={[styles.section, styles.twoCol]}>
          <View style={styles.col}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.value}>{profile?.full_name}</Text>
            {profile?.unit_number ? (
              <Text style={styles.value}>Flat: {profile?.unit_number}</Text>
            ) : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Bill Info</Text>
            <Text style={styles.value}>Month: {monthLabel}</Text>
            <Text style={styles.value}>Due date: {dueDate}</Text>
            {bill.razorpay_payment_id ? (
              <Text style={styles.value}>
                Payment ID: {bill.razorpay_payment_id}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.th, { flex: 2 }]}>Description</Text>
            <Text style={[styles.th, styles.right]}>Amount</Text>
            <Text style={[styles.th, styles.right]}>Penalty</Text>
            <Text style={[styles.th, styles.right]}>Subtotal</Text>
          </View>

          {rows.map((r, idx) => (
            <View style={styles.tr} key={idx}>
              <Text style={[styles.td, { flex: 2 }]}>{r.desc}</Text>
              <Text style={[styles.td, styles.right]}>{r.amount}</Text>
              <Text style={[styles.td, styles.right]}>{r.penalty || 0}</Text>
              <Text style={[styles.td, styles.right]}>
                {r.subtotal != null ? r.subtotal : r.amount + (r.penalty || 0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals boxes */}
        <View
          style={[
            {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
            },
          ]}
        >
          {/* Extras detail box */}
          <View style={styles.totalsBox}>
            <View style={[styles.totalsRow, styles.totalsHead]}>
              <Text style={styles.totalsLabel}>Extras</Text>
              <Text style={styles.totalsValue}></Text>
            </View>
            {extras.length > 0 ? (
              extras.map((ex) => {
                const exLabel =
                  ex.month && ex.year
                    ? `${ex.name} (${longMonth[Number(ex.month)]} ${ex.year})`
                    : ex.name;
                return (
                  <View style={styles.totalsRow} key={ex.id}>
                    <Text style={styles.totalsLabel}>{exLabel}</Text>
                    <Text style={styles.totalsValue}>
                      {Number(ex.amount) || 0}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>No extras</Text>
                <Text style={styles.totalsValue}>0</Text>
              </View>
            )}
            <View style={[styles.totalsRow, styles.totalsHead]}>
              <Text style={styles.totalsLabel}>Total</Text>
              <Text style={styles.totalsValue}>{extrasTotal}</Text>
            </View>
          </View>

          {/* Summary totals */}
          <View style={[styles.totalsBox, {}]}>
            <View style={[styles.totalsRow, styles.totalsHead]}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{subTotal}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Extras</Text>
              <Text style={styles.totalsValue}>{extrasTotal}</Text>
            </View>
            <View style={[styles.totalsRow, styles.totalsHead]}>
              <Text style={styles.totalsLabel}>Total</Text>
              <Text style={styles.totalsValue}>{grandTotal}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

export function BillPdfDownload({
  bill,
  extras,
}: {
  bill: MaintenanceBill;
  extras: ExtraItem[];
}) {
  return (
    <PDFDownloadLink
      document={<BillPdf bill={bill} extras={extras} />}
      fileName={`bill-${bill.id}.pdf`}
    >
      <div className="cursor-pointer border border-gray-100 p-2 rounded-full w-[40px] h-[40px] flex items-center justify-center hover:bg-gray-100">
        <Download className="w-[20px] h-[20px]" />
      </div>
    </PDFDownloadLink>
  );
}

const ViewMaintananceDetailsModal: React.FC<ViewMaintananceModalProps> = ({
  isOpen,
  onClose,
  bill,
  residentInfo = true,
}) => {
  const { getStatusColor, getStatusIcon, longMonth } = useCommonService();

  const extrasList = useMemo(() => {
    const bills = bill?.breakdown?.dues?.map((due) => due?.extras);
    return bill ? [...(bills || []), bill?.breakdown?.extras] : [];
  }, [bill]);

  console.log(extrasList);

  return (
    <Modal
      title={`Maintanance Details`}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Resident Information */}
        {residentInfo && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Resident Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Unit Number</p>
                  <p className="font-medium text-gray-900">
                    {bill?.resident?.unit_number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {bill?.resident?.full_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {bill?.resident?.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bill Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Bill Information
            </h3>
            {bill && (
              <BillPdfDownload
                bill={bill as MaintenanceBill}
                extras={extrasList.flat()}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Bill Period</p>
                <p className="font-medium text-gray-900">
                  {new Date(
                    Number(bill?.bill_year),
                    Number(bill?.bill_month) - 1
                  ).toLocaleDateString("en-US", { month: "long" })}{" "}
                  {bill?.bill_year}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`capitalize inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    bill?.status as string
                  )}`}
                >
                  {getStatusIcon(bill?.status as string)}
                  {bill?.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Amount Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                Maintenance & Penalty
              </h3>
              {/* Prior dues */}
              {(bill?.breakdown?.dues || []).map((due) => (
                <div key={`${due.year}-${due.month}`}>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Maintenance ({longMonth[Number(due?.month) - 1]}{" "}
                      {bill?.bill_year})
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{due?.amount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Penalty ({longMonth[Number(due?.month) - 1]}{" "}
                      {bill?.bill_year})
                    </span>
                    <span className="font-medium text-red-600">
                      ₹{due?.penalty || 0}
                    </span>
                  </div>
                </div>
              ))}
              {/* Current base */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Maintenance ({longMonth[Number(bill?.bill_month) - 1]}{" "}
                  {bill?.bill_year})
                </span>
                <span className="font-medium text-gray-900">
                  ₹{bill?.breakdown?.base}
                </span>
              </div>

              {/* Current extras list */}
              {extrasList.length > 0 && (
                <>
                  <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2 mt-4">
                    Additional Charges
                  </h3>
                  {extrasList.map((ex) => (
                    <ExtraListItem items={ex} />
                  ))}
                </>
              )}
            </div>

            {/* Grand total */}
            <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-4">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-xl font-bold text-blue-600">
                ₹{bill?.amount}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Details (if paid) */}
        {bill?.status === "paid" && bill?.razorpay_payment_id && (
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Details
            </h3>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="font-medium text-gray-900">
                  {bill?.razorpay_payment_id}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const ExtraListItem = ({ items }: { items: ExtraItem[] }) => {
  const { longMonth } = useCommonService();
  return items.map((item) => {
    return (
      <div
        key={item.id}
        className="flex justify-between items-center py-2 border-b border-gray-100"
      >
        <span className="text-gray-600">
          {item.name} ({longMonth[Number(item.month) - 1]} {item.year})
        </span>
        <span className="font-medium text-gray-900">₹{item.amount || 0}</span>
      </div>
    );
  });
};

export default ViewMaintananceDetailsModal;
