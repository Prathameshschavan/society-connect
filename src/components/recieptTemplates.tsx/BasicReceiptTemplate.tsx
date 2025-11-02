import React, { useRef, useState } from "react";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";
import {
  useOrganizationStore,
  type ExtraItem,
} from "../../libs/stores/useOrganizationStore";
import { longMonth } from "../../utility/dateTimeServices";
import { Download, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";


// Receipt Template Component (Hidden, used for PDF generation)
export const ReceiptTemplate: React.FC<{
  bill: MaintenanceBill;
  extras: ExtraItem[];
  organizationName: string;
  organizationAddress: string;
}> = ({ bill, extras, organizationName, organizationAddress }) => {
  const extrasTotal = (extras || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const monthLabel = `${longMonth[Number(bill?.bill_month) - 1]} ${bill?.bill_year}`;
  const dueDate = bill?.due_date
    ? new Date(bill?.due_date).toLocaleDateString("en-IN")
    : "-";

  // Build table rows
  const rows: Array<{
    desc: string;
    amount: number;
    penalty?: number;
    subtotal?: number;
  }> = [];

  // Current month base
  rows.push({
    desc: `Base charge (${monthLabel})`,
    amount: bill?.breakdown?.base ?? 0,
  });

  // Previous dues
  (bill?.breakdown?.dues || []).forEach((d) => {
    const label = `Due ${longMonth[Number(d.month)]} ${d.year}`;
    rows.push({
      desc: `${label}${d.penalty ? " + Penalty" : ""}`,
      amount: d.amount,
      penalty: d.penalty || 0,
      subtotal: d.amount + (d.penalty || 0),
    });
  });

  // Totals
  const baseTotal = bill?.breakdown?.base ?? 0;
  const duesPenaltyTotal = (bill?.breakdown?.dues || []).reduce(
    (sum, d) => sum + (d.amount || 0) + (d.penalty || 0),
    0
  );
  const subTotal = baseTotal + duesPenaltyTotal;
  const grandTotal = typeof bill?.amount === "number" ? bill?.amount : subTotal;

  const tableHeadStyle = {
    padding: "18px 12px",
    textAlign: "right",
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase", 
    letterSpacing: "0.5px",
    borderBottom: "2px solid #e5e7eb",
    marginTop: "-15px",
  } as const;


  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#ffffff",
        color: "#1f2937",
      }}
    >
      {/* Header with gradient */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "20px",
          borderRadius: "12px 12px 0 0",
          color: "white",
          marginBottom: "20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginTop: "-15px" }}>
            {organizationName}
          </h1>
          {organizationAddress && (
            <p style={{ margin: "0", fontSize: "14px", opacity: "0.95" }}>
              {organizationAddress}
            </p>
          )}
        </div>
        <div
          style={{
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ margin: "0 0 5px 0", fontSize: "12px", opacity: "0.9" }}>
              Receipt No.
            </p>
            <p style={{ margin: "0", fontSize: "18px", fontWeight: "600" }}>
              #{bill?.id}
            </p>
          </div>
          <div
            style={{
              padding: "12px 20px",
              borderRadius: "20px",
              backgroundColor: "rgba(255,255,255,0.2)",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            <p style={{ marginTop: "-15px" }}>{bill?.status}</p>
          </div>
        </div>
      </div>

      {/* Bill Details Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Bill To */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              margin: "-15px 0 12px 0",
              fontSize: "14px",
              color: "#6b7280",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Bill To
          </h3>
          <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
            {bill?.resident?.full_name}
          </p>
          {bill?.resident?.unit_number && (
            <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#6b7280" }}>
              Flat: {bill?.resident?.unit_number}
            </p>
          )}
          {bill?.resident?.phone && (
            <p style={{ margin: "0", fontSize: "14px", color: "#6b7280" }}>
              Phone: {bill?.resident?.phone}
            </p>
          )}
        </div>

        {/* Bill Info */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#eff6ff",
            borderRadius: "8px",
            border: "1px solid #dbeafe",
          }}
        >
          <h3
            style={{
              margin: "-15px 0 12px 0",
              fontSize: "14px",
              color: "#1e40af",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Bill Information
          </h3>
          <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1e3a8a" }}>
            <strong style={{ fontWeight: "600" }}>Period:</strong> {monthLabel}
          </p>
          <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1e3a8a" }}>
            <strong style={{ fontWeight: "600" }}>Due Date:</strong> {dueDate}
          </p>
          {bill?.razorpay_payment_id && (
            <p style={{ margin: "0", fontSize: "12px", color: "#1e3a8a" }}>
              <strong style={{ fontWeight: "600" }}>Payment ID:</strong> {bill?.razorpay_payment_id}
            </p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: "30px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th
                style={{...tableHeadStyle, textAlign: "left"}}
              >
                <p style={{ marginTop: "-15px", fontSize: "12px", color: "#374151" }}>
                  Description
                </p>
              </th>
              <th
                style={tableHeadStyle}
              >
                <p style={{ marginTop: "-15px", fontSize: "12px", color: "#374151" }}>
                  Amount
                </p>
              </th>
              <th
                style={tableHeadStyle}
              >
                <p style={{ marginTop: "-15px", fontSize: "12px", color: "#374151" }}>
                  Penalty
                </p>
              </th>
              <th
                style={tableHeadStyle}
              >
                <p style={{ marginTop: "-15px", fontSize: "12px", color: "#374151" }}>
                  Subtotal
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: idx < rows.length - 1 ? "1px solid #f3f4f6" : "none",
                  backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                }}
              >
                <td style={{ padding: "14px 12px", fontSize: "14px", color: "#1f2937" }}>
                  <p style={{ marginTop: "-15px" }}>
                    {r.desc}
                  </p>
                </td>
                <td style={{ padding: "14px 12px", textAlign: "right", fontSize: "14px", color: "#1f2937" }}>
                  <p style={{ marginTop: "-15px" }}>
                    ₹{r.amount.toLocaleString("en-IN")}
                  </p>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                        textAlign: "right",
                    fontSize: "14px",
                    color: r.penalty ? "#dc2626" : "#6b7280",
                  }}
                >
                  <p style={{ marginTop: "-15px" }}>
                    ₹{(r.penalty || 0).toLocaleString("en-IN")}
                  </p>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    textAlign: "right",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  <p style={{ marginTop: "-15px" }}>
                    ₹
                    {(r.subtotal != null
                      ? r.subtotal
                      : r.amount + (r.penalty || 0)
                    ).toLocaleString("en-IN")}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Extras and Totals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        {/* Extras */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fef3c7",
            borderRadius: "8px",
            border: "1px solid #fde68a",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#92400e",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Additional Charges
          </h3>
          {extras?.length > 0 ? (
            <>
              {extras.map((ex) => {
                const exLabel =
                  ex.month && ex.year
                    ? `${ex.name} (${longMonth[Number(ex.month)]} ${ex.year})`
                    : ex.name;
                return (
                  <div
                    key={ex.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid #fde68a",
                      fontSize: "14px",
                    }}
                  >
                    <span style={{ color: "#78350f" }}>{exLabel}</span>
                    <span style={{ fontWeight: "600", color: "#78350f" }}>
                      ₹{(Number(ex.amount) || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "2px solid #fbbf24",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#78350f",
                }}
              >
                <span>Total Extras</span>
                <span>₹{extrasTotal.toLocaleString("en-IN")}</span>
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#78350f" }}>
                No additional charges
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "2px solid #fbbf24",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#78350f",
                }}
              >
                <span>Total Extras</span>
                <span>₹0</span>
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#dbeafe",
            borderRadius: "8px",
            border: "1px solid #93c5fd",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#1e40af",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Summary
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              fontSize: "14px",
              color: "#1e3a8a",
            }}
          >
            <span>Subtotal</span>
            <span style={{ fontWeight: "600" }}>₹{subTotal.toLocaleString("en-IN")}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              fontSize: "14px",
              color: "#1e3a8a",
            }}
          >
            <span>Extras</span>
            <span style={{ fontWeight: "600" }}>₹{extrasTotal.toLocaleString("en-IN")}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "2px solid #3b82f6",
              fontSize: "18px",
              fontWeight: "700",
              color: "#1e40af",
            }}
          >
            <span>Grand Total</span>
            <span>₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "2px solid #e5e7eb",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "12px",
        }}
      >
        <p style={{ margin: "0 0 5px 0" }}>Thank you for your payment!</p>
        <p style={{ margin: "0" }}>
          This is a computer-generated receipt and does not require a signature.
        </p>
      </div>
    </div>
  );
};



function BillPdfDownload({
  bill,
  extras,
}: {
  bill: MaintenanceBill;
  extras: ExtraItem[];
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { residentOrganization } = useOrganizationStore();

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    setIsGenerating(true);
    try {
      const opt = {
        margin: 0,
        filename: `receipt-${bill?.id}-${bill?.bill_month}-${bill?.bill_year}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(receiptRef.current).save();
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const organizationAddress = [
    residentOrganization?.address,
    residentOrganization?.city,
    residentOrganization?.state,
    residentOrganization?.pincode,
  ]
    .filter((val) => val)
    .join(", ");

  return (
    <>
      {/* Hidden receipt template for PDF generation */}
      <div style={{ position: "absolute", left: "-9999px", top: "0" }}>
        <div ref={receiptRef}>
          <ReceiptTemplate
            bill={bill}
            extras={extras}
            organizationName={residentOrganization?.name || ""}
            organizationAddress={organizationAddress}
          />
        </div>
      </div>

      {/* Download button */}
      <div
        onClick={handleDownload}
        className={`cursor-pointer border border-gray-100 p-2 rounded-full w-[40px] h-[40px] flex items-center justify-center hover:bg-gray-100 transition-colors ${isGenerating ? "opacity-70 cursor-wait" : ""
          }`}
        title={isGenerating ? "Generating PDF..." : "Download PDF"}
      >
        {isGenerating ? (
          <Loader2 className="w-[20px] h-[20px] animate-spin text-blue-600" />
        ) : (
          <Download className="w-[20px] h-[20px]" />
        )}
      </div>
    </>
  );
}

export default BillPdfDownload;
