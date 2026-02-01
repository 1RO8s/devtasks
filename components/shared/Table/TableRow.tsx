import type React from 'react';

type TableRowProps = {
  children: React.ReactNode;
  className?: string;
};

const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={`hover:bg-gray-100 ${className}`}>{children}</tr>;
};

export default TableRow;
