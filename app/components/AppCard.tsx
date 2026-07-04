import bankCatalog from "../banks";
import { type App } from "../catalog";
import { METHOD_LABEL, type Payment, type AppStatus, type AppUse, type AppPlatform, type CardProps } from "../lib/types";
import { getDaysUntilDue, paymentLabel, paymentDueLabel } from "../lib/utils";
import { CheckIcon, LockIcon, PinIcon } from "./icons";

function PaymentBadge({ payment, currency, d, blur }: { payment: Payment; currency: string; d: boolean; blur?: boolean }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${
      payment.type === "free"
        ? d ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"
        : d ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600"
    }`}>
      {blur ? <span className="blur-sm select-none">{paymentLabel(payment, currency)}</span> : paymentLabel(payment, currency)}
    </span>
  );
}

export function AppCard({ app, url, payment, currency, notes, status, bank, pinned, use, platform, email, hint, nickname, d, selectMode, isSelected, viewMode, cardProps, blurAmounts, isLocked, onOpen, onToggleSelect }: {
  app: App; url: string; payment?: Payment; currency: string; notes?: string; status?: AppStatus; bank?: string; pinned?: boolean; use?: AppUse; platform?: AppPlatform; email?: string; hint?: string; nickname?: string; d: boolean;
  selectMode: boolean; isSelected: boolean; viewMode: "grid" | "list"; cardProps: CardProps; blurAmounts?: boolean; isLocked?: boolean;
  onOpen: () => void; onToggleSelect: () => void;
}) {
  const bankData = bank ? bankCatalog.find((b) => b.name === bank) : null;
  const daysUntilDue = payment ? getDaysUntilDue(payment) : null;
  const dueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7 && status !== "cancelled" && status !== "trial";
  const isCancelled = status === "cancelled";
  const isTrial = status === "trial";

  const dueSoonLabel = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7
    ? daysUntilDue === 0 ? "Due today!" : `Due in ${daysUntilDue}d`
    : null;

  const showPaymentInfo = status !== "trial" && status !== "cancelled";
  const tooltipMetaBase = [
    app.brand,
    use === "business" ? "Business" : "Personal",
    bankData ? bankData.name : null,
  ].filter(Boolean).join(" · ");
  const tooltipMetaPayment = [
    showPaymentInfo && payment ? paymentLabel(payment, currency) : null,
    showPaymentInfo && payment?.method ? METHOD_LABEL[payment.method] : null,
    showPaymentInfo && payment ? paymentDueLabel(payment) : null,
    showPaymentInfo ? dueSoonLabel : null,
  ].filter(Boolean).join(" · ");

  const cardBase = `relative rounded-2xl border transition-all duration-200 group-hover:-translate-y-px ${isCancelled ? "opacity-50" : ""} ${
    isSelected && selectMode
      ? d ? "bg-amber-500/10 border-amber-500/60" : "bg-amber-50 border-amber-400"
      : d ? "bg-white/5 border-white/10 group-hover:bg-white/8 group-hover:border-white/15" : "bg-white border-black/[0.08] group-hover:bg-[#f9f8f5] group-hover:shadow-sm"
  }`;

  if (isLocked) {
    const lockedBase = `relative rounded-2xl border transition-all duration-200 cursor-pointer ${d ? "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15" : "bg-white border-black/[0.08] hover:bg-[#f9f8f5] hover:shadow-sm"}`;
    if (viewMode === "grid") {
      return (
        <div className={`${lockedBase} flex items-center justify-center min-h-[7rem]`} onClick={onOpen} title="Locked — click to manage">
          <span className={d ? "text-gray-600" : "text-gray-300"}><LockIcon size={22} /></span>
        </div>
      );
    }
    return (
      <div className={`${lockedBase} flex items-center justify-center px-4 py-3 h-full`} onClick={onOpen} title="Locked — click to manage">
        <span className={d ? "text-gray-600" : "text-gray-300"}><LockIcon size={18} /></span>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="group relative cursor-pointer" onClick={selectMode ? onToggleSelect : onOpen}>
        {!selectMode && (
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-56 text-xs rounded-xl px-3 py-2.5 leading-snug pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${d ? "bg-gray-800 text-gray-300" : "bg-gray-900 text-white"}`}>
            <div>{app.description}</div>
            {(tooltipMetaBase || tooltipMetaPayment) && (
              <div className={`mt-1.5 text-[11px] ${d ? "text-gray-500" : "text-gray-400"}`}>
                {tooltipMetaBase}
                {tooltipMetaBase && tooltipMetaPayment ? " · " : ""}
                {tooltipMetaPayment && (blurAmounts ? <span className="blur-sm select-none">{tooltipMetaPayment}</span> : tooltipMetaPayment)}
              </div>
            )}
            {email && <div className={`mt-1.5 text-[11px] border-t border-white/10 pt-1.5 ${d ? "text-sky-400" : "text-sky-500"}`}>{email}</div>}
            {hint && <div className="mt-1.5 text-[11px] border-t border-white/10 pt-1.5 text-violet-400">🔑 {hint}</div>}
            {notes && <div className="mt-1.5 text-[11px] italic border-t border-white/10 pt-1.5 text-amber-400">{notes}</div>}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${d ? "border-t-gray-800" : "border-t-gray-900"}`} />
          </div>
        )}
        <div className={`${cardBase} relative flex flex-col items-center px-2.5 pt-5 pb-7 min-h-[7rem]`}>
          {/* Icon */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-xl mb-2 flex-shrink-0" />

          {/* Name + inline indicators */}
          <div className="flex items-center justify-center gap-1 w-full px-1">
            <span className={`text-[11px] font-semibold text-center leading-tight line-clamp-2 ${d ? "text-gray-100" : "text-gray-800"}`}>{nickname ?? app.name}</span>
            {!selectMode && pinned && <span className="text-amber-500 flex-shrink-0"><PinIcon size={8} filled /></span>}
            {!selectMode && dueSoon && <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />}
          </div>

          {/* Brand */}
          {cardProps.brand && <span className={`text-[9px] text-center mt-0.5 ${d ? "text-gray-600" : "text-gray-400"}`}>{app.brand}</span>}

          {/* Chips — status / use / platform */}
          {!selectMode && (
            <div className="flex flex-wrap justify-center gap-0.5 mt-1.5 px-1">
              {cardProps.status && isTrial && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium leading-none ${d ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"}`}>Trial</span>
              )}
              {cardProps.status && isCancelled && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium leading-none ${d ? "bg-gray-500/20 text-gray-500" : "bg-gray-100 text-gray-400"}`}>Cancelled</span>
              )}
              {cardProps.use && !isTrial && !isCancelled && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium leading-none ${use === "business" ? d ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600" : d ? "bg-sky-500/15 text-sky-400" : "bg-sky-50 text-sky-600"}`}>
                  {use === "business" ? "Business" : "Personal"}
                </span>
              )}
              {cardProps.platform && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium leading-none ${(platform ?? "desktop") === "mobile" ? d ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600" : (platform ?? "desktop") === "both" ? d ? "bg-teal-500/15 text-teal-400" : "bg-teal-50 text-teal-600" : d ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                  {(platform ?? "desktop") === "mobile" ? "Mobile" : (platform ?? "desktop") === "both" ? "Desktop and Mobile" : "Desktop"}
                </span>
              )}
            </div>
          )}

          {/* Payment badge */}
          {!selectMode && cardProps.payment && showPaymentInfo && payment && (
            <div className="mt-1.5"><PaymentBadge payment={payment} currency={currency} d={d} blur={blurAmounts} /></div>
          )}

          {/* Method chip */}
          {!selectMode && cardProps.method && payment?.method && !isTrial && !isCancelled && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium leading-none mt-1 ${d ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{METHOD_LABEL[payment.method]}</span>
          )}

          {/* Due date */}
          {!selectMode && cardProps.dueDate && payment && paymentDueLabel(payment) && (
            <span className={`text-[9px] mt-0.5 leading-none ${dueSoon ? "text-orange-400 font-medium" : d ? "text-gray-500" : "text-gray-400"}`}>
              {dueSoon && dueSoonLabel ? dueSoonLabel : paymentDueLabel(payment)}
            </span>
          )}

          {/* Bank icon — bottom-left corner */}
          {!selectMode && cardProps.bank && bankData && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bankData.icon} alt={bankData.name} className="absolute bottom-2.5 left-2.5 w-4 h-4 rounded-md" title={bankData.name} />
          )}

          {/* Select indicator */}
          {selectMode && (
            <div className={`mt-2 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isSelected ? "bg-amber-500 text-white" : d ? "bg-white/15 text-transparent" : "bg-black/10 text-transparent"}`}>
              {isSelected && <CheckIcon />}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative cursor-pointer h-full" onClick={selectMode ? onToggleSelect : onOpen}>

      {/* Tooltip — only in normal mode */}
      {!selectMode && (
        <div className={`absolute bottom-full left-0 mb-2.5 w-56 text-xs rounded-xl px-3 py-2.5 leading-snug pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${d ? "bg-gray-800 text-gray-300" : "bg-gray-900 text-white"}`}>
          <div>{app.description}</div>
          {(tooltipMetaBase || tooltipMetaPayment) && (
            <div className={`mt-1.5 text-[11px] ${d ? "text-gray-500" : "text-gray-400"}`}>
              {tooltipMetaBase}
              {tooltipMetaBase && tooltipMetaPayment ? " · " : ""}
              {tooltipMetaPayment && (blurAmounts ? <span className="blur-sm select-none">{tooltipMetaPayment}</span> : tooltipMetaPayment)}
            </div>
          )}
          {email && (
            <div className={`mt-1.5 text-[11px] border-t border-white/10 pt-1.5 ${d ? "text-sky-400" : "text-sky-500"}`}>{email}</div>
          )}
          {hint && (
            <div className="mt-1.5 text-[11px] border-t border-white/10 pt-1.5 text-violet-400">🔑 {hint}</div>
          )}
          {notes && (
            <div className="mt-1.5 text-[11px] italic border-t border-white/10 pt-1.5 text-amber-400">{notes}</div>
          )}
          <div className={`absolute top-full left-4 border-4 border-transparent ${d ? "border-t-gray-800" : "border-t-gray-900"}`} />
        </div>
      )}

      <div className={`${cardBase} flex items-center gap-3 px-4 py-3 h-full`}>

        {/* App icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-xl flex-shrink-0" />

        {/* Left: name, brand, chips */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-sm font-semibold truncate ${d ? "text-gray-100" : "text-gray-800"}`}>{nickname ?? app.name}</span>
            {!selectMode && pinned && <span className="text-amber-500 flex-shrink-0"><PinIcon size={10} filled /></span>}
            {dueSoon && !selectMode && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />}
          </div>
          {cardProps.brand && <span className={`text-xs truncate block ${d ? "text-gray-500" : "text-gray-400"}`}>{app.brand}</span>}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {cardProps.status && isTrial && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${d ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"}`}>Trial</span>
            )}
            {cardProps.status && isCancelled && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${d ? "bg-gray-500/20 text-gray-500" : "bg-gray-100 text-gray-400"}`}>Cancelled</span>
            )}
            {cardProps.use && !isTrial && !isCancelled && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${
                use === "business"
                  ? d ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                  : d ? "bg-sky-500/15 text-sky-400" : "bg-sky-50 text-sky-600"
              }`}>{use === "business" ? "Business" : "Personal"}</span>
            )}
            {cardProps.platform && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${
                (platform ?? "desktop") === "mobile"
                  ? d ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"
                  : (platform ?? "desktop") === "both"
                    ? d ? "bg-teal-500/15 text-teal-400" : "bg-teal-50 text-teal-600"
                    : d ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"
              }`}>
                {(platform ?? "desktop") === "mobile" ? "Mobile" : (platform ?? "desktop") === "both" ? "Desktop and Mobile" : "Desktop"}
              </span>
            )}
          </div>
        </div>

        {/* Right: payment info */}
        {!selectMode && (
          <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
            {cardProps.payment && showPaymentInfo && payment && <PaymentBadge payment={payment} currency={currency} d={d} blur={blurAmounts} />}
            {cardProps.method && payment?.method && !isTrial && !isCancelled && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${d ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{METHOD_LABEL[payment.method]}</span>
            )}
            {cardProps.dueDate && payment && paymentDueLabel(payment) && (
              <span className={`text-[10px] leading-none ${dueSoon ? "text-orange-400 font-medium" : d ? "text-gray-500" : "text-gray-400"}`}>
                {dueSoon && dueSoonLabel ? dueSoonLabel : paymentDueLabel(payment)}
              </span>
            )}
            {cardProps.bank && bankData && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={bankData.icon} alt={bankData.name} className="w-4 h-4 rounded-md" title={bankData.name} />
            )}
          </div>
        )}

        {/* Select mode indicator */}
        {selectMode && (
          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
            isSelected ? "bg-amber-500 text-white" : d ? "bg-white/15 text-transparent" : "bg-black/10 text-transparent"
          }`}>
            {isSelected && <CheckIcon />}
          </div>
        )}
      </div>
    </div>
  );
}
