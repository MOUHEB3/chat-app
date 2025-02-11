// src/helpers/colorsUtils.ts

import colors from "colors";

const colorsStyles = {
  // Define various styles
  error: colors.red.bold,
  warning: colors.yellow,
  success: colors.green,
  info: colors.blue,
  debug: colors.gray,
};

const colorsUtils = {
  // Function to apply a style based on a type
  log: (type: keyof typeof colorsStyles, message: string): void => {
    switch (type) {
      case "error":
        console.error(colorsStyles.error(message));
        break;
      case "warning":
        console.warn(colorsStyles.warning(message));
        break;
      case "success":
        console.log(colorsStyles.success(message));
        break;
      case "info":
        console.log(colorsStyles.info(message));
        break;
      case "debug":
        console.log(colorsStyles.debug(message));
        break;
      default:
        console.log(message);
        break;
    }
  },

  // Log when a user goes online or offline
  logUserStatusChange: (userId: string, status: string): void => {
    const statusMessage = `User with ID: ${userId} is now ${status}`;
    if (status === "online") {
      colorsUtils.log("success", statusMessage);  // Log in green when the user is online
    } else {
      colorsUtils.log("info", statusMessage);  // Log in blue when the user is offline
    }
  },
};

export default colorsUtils;
