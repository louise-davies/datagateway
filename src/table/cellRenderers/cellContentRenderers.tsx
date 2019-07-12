import React from 'react';
import { Link } from 'react-router-dom';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

export function datasetLink(
  investigationId: string,
  datasetId: number,
  datasetName: string
): React.ReactElement {
  return (
    <Link
      to={`/browse/investigation/${investigationId}/dataset/${datasetId}/datafile`}
    >
      {datasetName}
    </Link>
  );
}

export function investigationLink(
  investigationId: number,
  investigationTitle: string
): React.ReactElement {
  return (
    <Link to={`/browse/investigation/${investigationId}/dataset`}>
      {investigationTitle}
    </Link>
  );
}
