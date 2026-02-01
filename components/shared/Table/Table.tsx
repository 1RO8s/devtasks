import React from 'react';
import Cell from './TableCell';
import Row from './TableRow';

type TableProps = {
  headers: (string | React.ReactNode)[];
  children: React.ReactNode;
  tableClassName?: string;
  trClassName?: string;
};

const TableComponent: React.FC<TableProps> = ({
  headers,
  children,
  tableClassName,
  trClassName,
}) => {
  return (
    <table
      className={`min-w-full bg-white shadow-md rounded-md ${tableClassName}`}
    >
      <thead>
        <tr className={`bg-gray-200 ${trClassName}`}>
          {headers.map((header, index) => (
            <React.Fragment key={index}>
              {typeof header === 'string' ? (
                <th className="py-2 px-4 border-b">{header}</th>
              ) : (
                header
              )}
            </React.Fragment>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

const Table = Object.assign(TableComponent, { Row, Cell });

export default Table;
