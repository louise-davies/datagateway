import axios from 'axios';
import type {
  Datafile,
  Download,
  DownloadCart,
  DownloadCartItem,
  SubmitCart,
} from 'datagateway-common';
import { readSciGatewayToken } from 'datagateway-common';

export const removeAllDownloadCartItems: (settings: {
  facilityName: string;
  downloadApiUrl: string;
}) => Promise<void> = (settings: {
  facilityName: string;
  downloadApiUrl: string;
}) => {
  return axios
    .delete(
      `${settings.downloadApiUrl}/user/cart/${settings.facilityName}/cartItems`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          items: '*',
        },
      }
    )
    .then(() => {
      // do nothing
    });
};

export const removeFromCart = (
  entityType: 'investigation' | 'dataset' | 'datafile',
  entityIds: number[],
  config: { facilityName: string; downloadApiUrl: string }
): Promise<DownloadCartItem[]> => {
  const { facilityName, downloadApiUrl } = config;

  return axios
    .delete<DownloadCart>(
      `${downloadApiUrl}/user/cart/${facilityName}/cartItems`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          items: `${entityType} ${entityIds.join(`, ${entityType} `)}`,
        },
      }
    )
    .then((response) => response.data.cartItems);
};

export const getIsTwoLevel: (settings: {
  idsUrl: string;
}) => Promise<boolean> = (settings: { idsUrl: string }) => {
  return axios
    .get<boolean>(`${settings.idsUrl}/isTwoLevel`)
    .then((response) => {
      return response.data;
    });
};

export type SubmitCartZipType = 'ZIP' | 'ZIP_AND_COMPRESS';

export const submitCart: (
  transport: string,
  emailAddress: string,
  fileName: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  },
  zipType?: SubmitCartZipType
) => Promise<number> = (
  transport,
  emailAddress,
  fileName,
  settings,
  zipType
) => {
  const params = new URLSearchParams();

  // Construct the form parameters.
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('transport', transport);
  params.append('email', emailAddress);
  params.append('fileName', fileName);

  // NOTE: zipType by default is 'ZIP', it can be 'ZIP_AND_COMPRESS'.
  params.append('zipType', zipType ? zipType : 'ZIP');

  return axios
    .post<SubmitCart>(
      `${settings.downloadApiUrl}/user/cart/${settings.facilityName}/submit`,
      params
    )
    .then((response) => {
      // Get the downloadId that was returned from the IDS server.
      return response.data['downloadId'];
    });
};

/**
 * Settings for {@link fetchDownloads}
 */
export interface FetchDownloadsSettings {
  facilityName: string;
  downloadApiUrl: string;
}

export const fetchDownloads: (
  settings: FetchDownloadsSettings,
  queryOffset?: string
) => Promise<Download[]> = (
  settings: FetchDownloadsSettings,
  queryOffset?: string
) => {
  return axios
    .get<Download[]>(`${settings.downloadApiUrl}/user/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: settings.facilityName,
        queryOffset: !queryOffset
          ? 'where download.isDeleted = false'
          : queryOffset,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const fetchAdminDownloads: (
  settings: { facilityName: string; downloadApiUrl: string },
  queryOffset?: string
) => Promise<Download[]> = (
  settings: { facilityName: string; downloadApiUrl: string },
  queryOffset?: string
) => {
  return axios
    .get<Download[]>(`${settings.downloadApiUrl}/admin/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: settings.facilityName,
        queryOffset: !queryOffset
          ? 'where download.isDeleted = false'
          : queryOffset,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const getDownload: (
  downloadId: number,
  settings: { facilityName: string; downloadApiUrl: string }
) => Promise<Download> = (
  downloadId: number,
  settings: { facilityName: string; downloadApiUrl: string }
) => {
  return axios
    .get<Download[]>(`${settings.downloadApiUrl}/user/downloads`, {
      params: {
        sessionId: readSciGatewayToken().sessionId,
        facilityName: settings.facilityName,
        queryOffset: `where download.id = ${downloadId}`,
      },
    })
    .then((response) => {
      const download = response.data[0];
      return download;
    });
};

export const downloadPreparedCart: (
  preparedId: string,
  fileName: string,
  settings: { idsUrl: string }
) => void = (
  preparedId: string,
  fileName: string,
  settings: { idsUrl: string }
) => {
  // Create our IDS link from the query parameters.
  const link = document.createElement('a');
  link.href = getDataUrl(preparedId, fileName, settings.idsUrl);

  // We trigger an immediate download which will begin in a new tab.
  link.style.display = 'none';
  link.target = '_blank';
  document.body.appendChild(link);

  // Prevent the link from being clicked if this is an e2e test.
  if (!process.env.REACT_APP_E2E_TESTING) {
    link.click();
    link.remove();
  }
};

/**
 * Describes the status of a download type.
 */
export interface DownloadTypeStatus {
  type: string;
  disabled: boolean;
  message: string;
}

export const getDownloadTypeStatus: (
  transportType: string,
  settings: { facilityName: string; downloadApiUrl: string }
) => Promise<DownloadTypeStatus> = (transportType, settings) =>
  axios
    // the server doesn't put the transport type into the response object
    // it will be put in after the fact so that it is easier to work with
    .get<Omit<DownloadTypeStatus, 'type'>>(
      `${settings.downloadApiUrl}/user/downloadType/${transportType}/status`,
      {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          facilityName: settings.facilityName,
        },
      }
    )
    .then((response) => ({
      type: transportType,
      ...response.data,
    }));

export const downloadDeleted: (
  downloadId: number,
  deleted: boolean,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => Promise<void> = (
  downloadId: number,
  deleted: boolean,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => {
  const params = new URLSearchParams();
  params.append('facilityName', settings.facilityName);
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('value', JSON.stringify(deleted));

  return axios.put(
    `${settings.downloadApiUrl}/user/download/${downloadId}/isDeleted`,
    params
  );
};

export const adminDownloadDeleted: (
  downloadId: number,
  deleted: boolean,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => Promise<void> = (
  downloadId: number,
  deleted: boolean,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => {
  const params = new URLSearchParams();
  params.append('facilityName', settings.facilityName);
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('value', JSON.stringify(deleted));

  return axios.put(
    `${settings.downloadApiUrl}/admin/download/${downloadId}/isDeleted`,
    params
  );
};

export const adminDownloadStatus: (
  downloadId: number,
  status: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => Promise<void> = (
  downloadId: number,
  status: string,
  settings: {
    facilityName: string;
    downloadApiUrl: string;
  }
) => {
  const params = new URLSearchParams();
  params.append('facilityName', settings.facilityName);
  params.append('sessionId', readSciGatewayToken().sessionId || '');
  params.append('value', status);

  return axios.put(
    `${settings.downloadApiUrl}/admin/download/${downloadId}/status`,
    params
  );
};

export const getSize: (
  entityId: number,
  entityType: string,
  settings: {
    facilityName: string;
    apiUrl: string;
    downloadApiUrl: string;
  }
) => Promise<number> = (
  entityId: number,
  entityType: string,
  settings: {
    facilityName: string;
    apiUrl: string;
    downloadApiUrl: string;
  }
) => {
  if (entityType === 'datafile') {
    return axios
      .get<Datafile>(`${settings.apiUrl}/datafiles/${entityId}`, {
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        const size = response.data['fileSize'] as number;
        return size;
      });
  } else {
    return axios
      .get<number>(`${settings.downloadApiUrl}/user/getSize`, {
        params: {
          sessionId: readSciGatewayToken().sessionId,
          facilityName: settings.facilityName,
          entityType: entityType,
          entityId: entityId,
        },
      })
      .then((response) => {
        return response.data;
      });
  }
};

export const getDatafileCount: (
  entityId: number,
  entityType: string,
  settings: { apiUrl: string }
) => Promise<number> = (
  entityId: number,
  entityType: string,
  settings: { apiUrl: string }
) => {
  if (entityType === 'datafile') {
    // need to do this in a setTimeout to ensure it doesn't block the main thread
    return new Promise((resolve) =>
      window.setTimeout(() => {
        resolve(1);
      }, 0)
    );
  } else if (entityType === 'dataset') {
    return axios
      .get<number>(`${settings.apiUrl}/datafiles/count`, {
        params: {
          where: {
            'dataset.id': {
              eq: entityId,
            },
          },
        },
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        return response.data;
      });
  } else {
    return axios
      .get<number>(`${settings.apiUrl}/datafiles/count`, {
        params: {
          where: {
            'dataset.investigation.id': {
              eq: entityId,
            },
          },
        },
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then((response) => {
        return response.data;
      });
  }
};

export const getDataUrl = (
  preparedId: string,
  fileName: string,
  idsUrl: string
): string => {
  // Construct a link to download the prepared cart.
  return `${idsUrl}/getData?sessionId=${
    readSciGatewayToken().sessionId
  }&preparedId=${preparedId}&outname=${fileName}`;
};
