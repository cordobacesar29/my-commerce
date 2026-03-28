"use client";

import Icon from "@/components/ui/AppIcon";

type StepKey = "cart" | "checkout" | "success";

interface CartHeaderProps {
  currentStep: StepKey;
}

const STEP_LIST = [
  { label: "Carrito", key: "cart" as StepKey, icon: "ShoppingCartIcon" },
  { label: "Datos", key: "checkout" as StepKey, icon: "CreditCardIcon" },
  { label: "Confirmado", key: "success" as StepKey, icon: "CheckBadgeIcon" },
];

export const CartHeader = ({ currentStep }: CartHeaderProps) => {
  const stepIndex = STEP_LIST.findIndex((s) => s.key === currentStep);

  const getTitle = () => {
    switch (currentStep) {
      case "checkout":
        return (
          <>
            Completá
            <br />
            <span className="text-gradient-gold">tu pedido</span>
          </>
        );
      default:
        return (
          <>
            Tu selección
            <br />
            <span className="text-gradient-gold">personalizada</span>
          </>
        );
    }
  };

  const getTag = () => {
    switch (currentStep) {
      case "checkout":
        return "Checkout";
      default:
        return "Tu carrito";
    }
  };

  return (
    <header
      className="py-12 px-6 mb-12 border-b flex"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div className="max-w-7xl mx-auto text-center">
        {/* Title Section */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{
              background: "rgba(200, 169, 110, 0.1)",
              border: "1px solid rgba(200, 169, 110, 0.2)",
              color: "var(--accent-gold)",
            }}
          >
            <Icon
              name={
                currentStep === "checkout"
                  ? "CreditCardIcon"
                  : "ShoppingCartIcon"
              }
              size={12}
              variant="solid"
            />
            {getTag()}
          </div>

          <h1
            className="uppercase text-4xl md:text-5xl font-heading font-black tracking-tight leading-[1.1]"
            style={{ color: "var(--text-primary)" }}
          >
            {getTitle()}
          </h1>
        </div>

        {/* Step Indicator */}
        <StepIndicator stepIndex={stepIndex} />
      </div>
    </header>
  );
};

interface StepIndicatorProps {
  stepIndex: number;
}

const StepIndicator = ({ stepIndex }: StepIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      {STEP_LIST.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <StepBadge isActive={i <= stepIndex} isCompleted={i < stepIndex} number={i + 1} />
            <span
              className="text-xs font-heading uppercase tracking-widest hidden sm:inline"
              style={{
                color:
                  i <= stepIndex
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
              }}
            >
              {s.label}
            </span>
          </div>
          {i < STEP_LIST.length - 1 && (
            <StepDivider isActive={i < stepIndex} />
          )}
        </div>
      ))}
    </div>
  );
};

interface StepBadgeProps {
  isActive: boolean;
  isCompleted: boolean;
  number: number;
}

const StepBadge = ({ isActive, isCompleted, number }: StepBadgeProps) => {
  return (
    <div
      className="w-7 h-7 flex items-center justify-center text-xs font-heading font-bold"
      style={{
        background: isActive ? "var(--accent-gold)" : "var(--bg-elevated)",
        color: isActive ? "var(--bg-primary)" : "var(--text-muted)",
        border: isActive
          ? "1px solid var(--accent-gold)"
          : "1px solid var(--border-soft)",
      }}
    >
      {isCompleted ? "✓" : number}
    </div>
  );
};

interface StepDividerProps {
  isActive: boolean;
}

const StepDivider = ({ isActive }: StepDividerProps) => {
  return (
    <div
      className="w-8 h-px mx-1 hidden sm:block"
      style={{
        background: isActive ? "var(--accent-gold)" : "var(--border-soft)",
      }}
    />
  );
};