import * as React from "react"
import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = ({ active, payload, label, indicator = "dot", nameKey = "name", labelKey = "payload", color, ...props }) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      {label && (
        <div className="border-b pb-2 mb-2">
          <p className="font-medium">{label}</p>
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            {indicator === "dot" && (
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color || color }}
              />
            )}
            <span className="text-sm">{item.name}:</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ChartTooltipContent = React.forwardRef(({ active, payload, label, indicator = "dot", ...props }, ref) => {
  return (
    <ChartTooltip
      ref={ref}
      active={active}
      payload={payload}
      label={label}
      indicator={indicator}
      {...props}
    />
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }