import { getHeader } from "@/helpers";
import axios from "axios";
import { getSysAllPermissionsURL, getCompanyUserByIdURL } from "@/services/api";

export function getSysAllPermissions() {
  return axios({
    url: getSysAllPermissionsURL(),
    method: "GET",
    headers: getHeader(),
  });
}

export function getCompanyUserById() {
  return axios({
    url: getCompanyUserByIdURL(),
    method: "GET",
    headers: getHeader(),
  });
}
