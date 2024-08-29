import { getHeader } from "@/helpers";
import axios from "axios";
import {
  getRolePermissionByIdURL,
  createUserRoleURL,
  getRolePermissionListURL,
  getRoleByIdURL,
  updateRoleURL,
  getUserPermissionURL,
} from "../api";

export function createRole(requestData) {
  return axios({
    url: createUserRoleURL(),
    data: requestData,
    method: "POST",
    headers: getHeader(),
  });
}

export function getRolePermissionById(requestData) {
  return axios({
    url: getRolePermissionByIdURL(),
    method: "POST",
    data: requestData,
    headers: getHeader(),
  });
}

export function getRolePermissionList(requestData) {
  return axios({
    url: getRolePermissionListURL(),
    method: "GET",
    headers: getHeader(),
  });
}

export function getRoleById(requestData) {
  return axios({
    url: getRoleByIdURL(),
    method: "POST",
    data: requestData,
    headers: getHeader(),
  });
}

export function updateRole(requestData) {
  return axios({
    url: updateRoleURL(),
    method: "POST",
    data: requestData,
    headers: getHeader(),
  });
}

export function getUserPermission(requestData) {
  return axios({
    url: getUserPermissionURL(),
    data: requestData,
    method: "POST",
    headers: getHeader(),
  });
}
