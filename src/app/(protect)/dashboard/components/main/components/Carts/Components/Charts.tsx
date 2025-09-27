type CustomTooltipProps = {
  active: boolean;
  payload: { name: string; value: number; color: string }[];
  label: string;
};

export const CustomTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Mês: ${label}`}</p>
        {payload.map(
          (
            item: { name: string; value: number; color: string },
            index: number
          ) => (
            <p key={index} style={{ color: item.color }}>
              {`${item.name}: R$ ${item.value.toLocaleString()}`}
            </p>
          )
        )}
      </div>
    );
  }
  return null;
};
