type PaginationQueryParams = {
  page?: number;
  limit?: number;
};

function normalizePage(value: number | undefined) {
  if (value === undefined || !Number.isInteger(value) || value < 1) {
    return undefined;
  }

  return value;
}

function normalizeLimit(value: number | undefined) {
  if (
    value === undefined ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 100
  ) {
    return undefined;
  }

  return value;
}

export function getPaginationQueryParams(params: PaginationQueryParams = {}) {
  return {
    page: normalizePage(params.page),
    limit: normalizeLimit(params.limit),
  };
}
