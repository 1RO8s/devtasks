import clsx from 'clsx';
import type React from 'react';

type TableCellProps = {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
};

const TableCell: React.FC<TableCellProps> = ({
  align,
  className,
  children,
}) => {
  return (
    <td
      className={clsx(
        'py-2 px-4 border-b',
        {
          'text-left': align === 'left',
          'text-center': align === 'center',
          'text-right': align === 'right',
        },
        className,
      )}
    >
      {children}
    </td>
  );
};

export default TableCell;
