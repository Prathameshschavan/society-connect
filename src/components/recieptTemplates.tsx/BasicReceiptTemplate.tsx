import React, { useMemo } from "react";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";
import {
  useOrganizationStore,
  type ExtraItem,
} from "../../libs/stores/useOrganizationStore";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { longMonth } from "../../utility/dateTimeServices";
import { Download } from "lucide-react";

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

const BasicReceiptTemplate: React.FC<{
  bill: MaintenanceBill;
  extras: ExtraItem[];
}> = ({ bill, extras }) => {
  const { residentOrganization } = useOrganizationStore();

  // Prefer array-based extras from breakdown; ignore legacy numeric fields

  const extrasTotal = extras.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const monthLabel = `${longMonth[Number(bill.bill_month)]} ${bill.bill_year}`;
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
    const label = `Due ${longMonth[Number(d.month)]} ${d.year}`;
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
            <Text style={styles.value}>{bill?.resident?.full_name}</Text>
            {bill?.resident?.unit_number ? (
              <Text style={styles.value}>
                Flat: {bill?.resident?.unit_number}
              </Text>
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
};

function BillPdfDownload({
  bill,
  extras,
}: {
  bill: MaintenanceBill;
  extras: ExtraItem[];
}) {
  return (
    <PDFDownloadLink
      document={<BasicReceiptTemplate bill={bill} extras={extras} />}
      fileName={`bill-${bill.id}.pdf`}
    >
      <div className="cursor-pointer border border-gray-100 p-2 rounded-full w-[40px] h-[40px] flex items-center justify-center hover:bg-gray-100">
        <Download className="w-[20px] h-[20px]" />
      </div>
    </PDFDownloadLink>
  );
}

export default BillPdfDownload;
