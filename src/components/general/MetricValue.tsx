import { Tooltip } from '@material-ui/core'
import clsx from 'clsx'
import _, { identity } from 'lodash'
import React from 'react'

import { MetricParameterType } from 'src/lib/schemas'
import { useDecorationStyles } from 'src/styles/styles'

function DashedTooltip(props: Parameters<typeof Tooltip>[0]) {
  const decorationClasses = useDecorationStyles()
  return <Tooltip className={clsx(decorationClasses.tooltipped, props.className)} {...props} />
}

/**
 * Precision to be inputed into _.round, to be used outside of graphs.
 */
const metricValueFormatPrecision = 2

interface MetricValueFormat {
  unit: React.ReactNode
  prefix: React.ReactNode
  postfix: React.ReactNode
  transform: (n: number) => number
  formatter: (n: number) => string
}

const standardNumberFormatter = (n: number): string => `${_.round(n, metricValueFormatPrecision)}`
const usdFormatter = (n: number): string =>
  n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

const impactNumberFormatter = (n: number): string => {
  if (Math.abs(n) > 1000000) {
    return `${(n / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
  }
  if (Math.abs(n) > 1000) {
    return `${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K`
  }
  return _.round(n).toLocaleString(undefined)
}

/**
 * Metric Formatting Data
 */
export const metricValueFormatData: Record<string, MetricValueFormat> = {
  count: {
    unit: '',
    prefix: '',
    postfix: '',
    transform: identity,
    formatter: (n: number): string => _.round(n, metricValueFormatPrecision).toLocaleString(undefined),
  },
  conversion: {
    unit: '%',
    prefix: '',
    postfix: '%',
    transform: (x: number): number => x * 100,
    formatter: standardNumberFormatter,
  },
  conversion_difference: {
    unit: 'pp',
    prefix: '',
    postfix: (
      <DashedTooltip title='Percentage points.'>
        <span>pp</span>
      </DashedTooltip>
    ),
    transform: (x: number): number => x * 100,
    formatter: standardNumberFormatter,
  },
  conversion_impact: {
    unit: '',
    prefix: '',
    postfix: ' conversions',
    transform: identity,
    formatter: impactNumberFormatter,
  },
  revenue: {
    unit: 'USD',
    prefix: '',
    postfix: <>&nbsp;USD</>,
    transform: identity,
    formatter: usdFormatter,
  },
  revenue_difference: {
    unit: 'USD',
    prefix: '',
    postfix: <>&nbsp;USD</>,
    transform: identity,
    formatter: usdFormatter,
  },
  revenue_impact: {
    unit: 'USD',
    prefix: '',
    postfix: <>&nbsp;USD</>,
    transform: identity,
    formatter: impactNumberFormatter,
  },
}

export function getMetricValueFormatData({
  metricParameterType,
  isDifference,
  isImpact,
}: {
  metricParameterType: MetricParameterType
  isDifference: boolean
  isImpact: boolean
}): MetricValueFormat {
  return metricValueFormatData[`${metricParameterType}${isDifference ? '_difference' : ''}${isImpact ? '_impact' : ''}`]
}

/**
 * Format a metric value to be used outside of a graph context.
 * @param value The metric value
 * @param metricParameterType
 * @param isDifference Is this an arithmetic difference between metric values
 * @param displayUnit Display the unit
 * @param displayPositiveSign Display the positive sign (+) when a value is positive.
 */
export default function MetricValue({
  value,
  metricParameterType,
  isDifference = false,
  displayUnit = true,
  displayPositiveSign = false,
  isImpact = false,
}: {
  value: number
  metricParameterType: MetricParameterType
  isDifference?: boolean
  displayUnit?: boolean
  displayPositiveSign?: boolean
  isImpact?: boolean
}): JSX.Element {
  const format = getMetricValueFormatData({ metricParameterType, isDifference, isImpact })
  return (
    <>
      {displayPositiveSign && 0 <= value && '+'}
      {displayUnit && format.prefix}
      {format.formatter(format.transform(value))}
      {displayUnit && format.postfix}
    </>
  )
}
