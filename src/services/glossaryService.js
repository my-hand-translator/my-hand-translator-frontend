import { PROJECT_API, STORAGE_API, STORAGE_UPLOAD_API } from "../constants/url";

import { convertCsvToJson } from "../utils/convert";
import fetchData, { createAuthHeader } from "../utils/fetchData";
import { refreshAndGetNewTokens } from "./oAuthService";

const GLOSSARY_NAME = "my-glossary";

export const getGlossaries = async (user, page, limit, keyword = "") => {
  const response = await fetch(
    `${process.env.SERVER_URL}/glossaries/?keywords=${keyword}&page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.tokens.idToken}`,
      },
    },
  );

  const data = await response.json();

  if (data.result === "error") {
    throw data;
  }

  return data.data;
};

export const getCsvFromGoogleStorage = async (
  { bucketId, clientId, clientSecret },
  tokens,
  errorHandler,
) => {
  const { accessToken, refreshToken } = tokens;
  const authHeader = createAuthHeader(accessToken);

  try {
    const response = await fetch(
      `${STORAGE_API}/${bucketId}/o/${GLOSSARY_NAME}.csv?alt=media`,
      {
        headers: { ...authHeader },
      },
    );
    let hasBucket = null;

    if (!response.ok) {
      const result = await response.text();

      if (result === "The specified bucket does not exist.") {
        hasBucket = false;
        return { hasBucket };
      }

      if (result === "Invalid Credentials") {
        const { accessToken: newAccessToken } = await refreshAndGetNewTokens(
          clientId,
          clientSecret,
          refreshToken,
        );

        return await getCsvFromGoogleStorage(
          {
            bucketId,
            clientId,
            clientSecret,
          },
          { accessToken: newAccessToken, refreshToken },
          errorHandler,
        );
      }
    }

    hasBucket = true;

    const bucketGlossaryData = await response.text();
    const glossaryData = convertCsvToJson(bucketGlossaryData);

    return { hasBucket, glossaryData };
  } catch (error) {
    return errorHandler(error.message);
  }
};

export const updateCsvFromGoogleStorage = async (
  { csv, bucketId, clientId, clientSecret },
  tokens,
  errorHandler,
) => {
  const { accessToken, refreshToken } = tokens;
  const authHeader = createAuthHeader(accessToken);

  try {
    const response = await fetch(
      `${STORAGE_UPLOAD_API}/${bucketId}/o?uploadType=media&name=${GLOSSARY_NAME}.csv`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": "text/plain; charset=utf-8",
        },
        body: csv,
      },
    );

    const { error } = await response.json();

    if (error?.message === "Invalid Credentials") {
      const { accessToken: newAccessToken } = await refreshAndGetNewTokens(
        clientId,
        clientSecret,
        refreshToken,
      );

      return await updateCsvFromGoogleStorage(
        { csv, bucketId, clientId, clientSecret },
        { accessToken: newAccessToken, refreshToken },
        errorHandler,
      );
    }
  } catch (error) {
    errorHandler(error.message);
  }

  return null;
};

export const getGlossaryFromServer = async (
  { userId, accessToken },
  errorHandler,
) => {
  const authHeader = createAuthHeader(accessToken);

  try {
    const { data, result } = await fetchData(
      `${process.env.SERVER_URL}/users/${userId}/glossary`,
      "GET",
      authHeader,
    );

    if (result !== "ok") {
      errorHandler(result.error.message);
    }

    return data;
  } catch (error) {
    return errorHandler(error.message);
  }
};

export const updateGlossaryFromServer = async (
  { glossaryId, glossary, accessToken },
  errorHandler,
) => {
  const authHeader = createAuthHeader(accessToken);

  try {
    const { result, error } = await fetchData(
      `${process.env.SERVER_URL}/glossaries/${glossaryId}`,
      "PATCH",
      authHeader,
      { glossary },
    );

    if (result === "error") {
      errorHandler(error.message);
    }
  } catch (error) {
    errorHandler(error.message);
  }
};

export const createBucket = async (
  { bucketId, projectId, accessToken },
  errorHandler,
) => {
  const authHeader = createAuthHeader(accessToken);

  const data = {
    name: bucketId,
    location: "asia-northeast3",
    storageClass: "Standard",
    iamConfiguration: {
      uniformBucketLevelAccess: {
        enabled: true,
      },
    },
  };

  try {
    const responseData = await fetchData(
      `${STORAGE_API}?project=${projectId}`,
      "POST",
      authHeader,
      data,
    );

    const { error } = responseData;

    if (error) {
      errorHandler(error.message);
    }
  } catch (error) {
    errorHandler(error.message);
  }
};

export const createGlossaryFromGoogleTranslation = async (
  { projectId, accessToken, bucketId },
  errorHandler,
) => {
  const authHeader = createAuthHeader(accessToken);

  try {
    const deleteResult = await fetchData(
      `${PROJECT_API}/${projectId}/locations/us-central1/glossaries/${GLOSSARY_NAME}`,
      "DELETE",
      authHeader,
    );

    if (deleteResult.error) {
      errorHandler(deleteResult.error.message);
    }

    const data = {
      name: `projects/${projectId}/locations/us-central1/glossaries/${GLOSSARY_NAME}`,
      languagePair: {
        sourceLanguageCode: "en",
        targetLanguageCode: "ko",
      },
      inputConfig: {
        gcsSource: {
          inputUri: `gs://${bucketId}/${GLOSSARY_NAME}.csv`,
        },
      },
    };

    const createResult = await fetchData(
      `${PROJECT_API}/${projectId}/locations/us-central1/glossaries`,
      "POST",
      authHeader,
      data,
    );

    if (createResult.error) {
      errorHandler(createResult.error.message);
    }
  } catch (error) {
    errorHandler(error.message);
  }
};
