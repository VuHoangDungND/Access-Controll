import axios from 'axios';
import { User, Device, Schedule, Permission, LoginCredentials, HistoryEntry } from '../types';
import { users, schedules } from '../mocks/data';
import { v4 as uuidv4 } from 'uuid';

// Delay function to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const THINGSBOARD_HOST = "http://18.142.251.211:8080"; 
const BE_HOST = "http://maxuanngoc.id.vn:8090";


const getToken = () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Chưa đăng nhập hoặc token không tồn tại");
  }
  return token;
}

// Auth service
export const authService = {
  login: async (loginData: LoginCredentials) => {
    const url_login = `${THINGSBOARD_HOST}/api/auth/login`;
    const url_user_info = `${THINGSBOARD_HOST}/api/auth/user`;
    
    try {
      const loginResponse = await axios.post(url_login, {
        username: loginData.username,
        password: loginData.password,
      }, {
        headers: {
          "Content-Type": "application/json",

        },
      });
      
      let token = loginResponse.data.token;
      // Lưu token vào localStorage
      sessionStorage.setItem("token", token);
      
      const userResponse = await axios.get(url_user_info, {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": `Bearer ${token}`,
        },
      });

      let fullName = userResponse.data.firstName + " " + userResponse.data.lastName;
      const user = {
        id: userResponse.data.id.id,
        username: userResponse.data.name,
        name: fullName === " " ? fullName : userResponse.data.name,
        idNumber: userResponse.data.idNumber || "unknown",
      };
      
      // Lưu thông tin user vào localStorage
      sessionStorage.setItem("user", JSON.stringify(user));
      
      return {
        user,
        token,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi đăng nhập");
    }
  },

  getUserInfo: async (token: string) => {
    const url_user_info = `${THINGSBOARD_HOST}/api/auth/user`;
    
    try {
      const userResponse = await axios.get(url_user_info, {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": `Bearer ${token}`,
        },
      });

      let fullName = userResponse.data.firstName + " " + userResponse.data.lastName;
      const user = {
        id: userResponse.data.id.id,
        username: userResponse.data.name,
        name: fullName === " " ? fullName : userResponse.data.name,
        idNumber: userResponse.data.idNumber || "UNKNOWN",
      };
      
      // Cập nhật thông tin user trong localStorage
      sessionStorage.setItem("user", JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      // Nếu có lỗi, xóa token và user khỏi localStorage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi lấy thông tin người dùng");
    }
  },

  logout: async () => {
    // Xóa token và user khỏi localStorage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return true;
  },
};

// User service
export const userService = {

  getUsers: async () => {

    const url_users = `${BE_HOST}/api/User/All`; // API lấy danh sách người dùng
    
    try {
      const response = await axios.get(url_users, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data.map((userProfile: any) => ({
        id: userProfile.id,
        username: userProfile.userName,
        name: userProfile.fullName,
        idNumber: userProfile.cccd,
        faceImage: userProfile.faceImg,
        fingerPrint: userProfile.fingerprint
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi lấy danh sách người dùng");
    }
  },
  
  getUserById: async (id: string): Promise<User | undefined> => {
    const url_user = `${BE_HOST}/api/User/${id}`; // API lấy danh sách người dùng
    
    try {
      const response = await axios.get(url_user, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data.map((userProfile: any) => ({
        id: userProfile.id,
        username: userProfile.userName,
        name: userProfile.fullName,
        idNumber: userProfile.cccd,
        faceImage: userProfile.faceImg,
        fingerPrint: userProfile.fingerprint
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi lấy dữ liệu người dùng");
    }
  },
  
  createUser: async (userData: Omit<User, 'id'>): Promise<void> => {
    const url = `${BE_HOST}/api/User`;

    const param = {
      fullName: userData.name,
      userName: userData.username,
      faceImg: userData.faceImage,
      cccd: userData.idNumber,
      fingerprint: userData.fingerPrint
    }

    try {
      await axios.post(url, param, {
        headers: {
          "Content-Type": "application/json",
        }
      });

    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi tạo người dùng");
    }
  },
  
  updateUser: async (id: string, userData: Partial<User>): Promise<void> => {
    const url_update_user = `${BE_HOST}/api/User/${id}`;

    const param = {
      id: id,
      fullName: userData.name,
      userName: userData.username,
      faceImg: userData.faceImage,
      cccd: userData.idNumber,
      fingerprint: userData.fingerPrint 
    }

    try {
      await axios.post(url_update_user, param, {
        headers: {
          "Content-Type": "application/json",
        }
      }); 

    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi cập nhật thông tin người dùng");
    }
  },
  
  deleteUser: async (id: string): Promise<void> => {
    const url = `${BE_HOST}/api/User/${id}`;

    try {
      await axios.delete(url, {
        headers: {
          "Content-Type": "application/json",
        }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi xóa người dùng");
    }
  },

  uploadUsers: async (formData: FormData): Promise<void> => {
    const url = `${THINGSBOARD_HOST}/api/user/upload`;

    try {
      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi tải lên danh sách người dùng");
    }
  },
};

// Device service
export const deviceService = {

  getDevices: async (pageSize: number = 10, page: number = 0) => {
    const token = getToken();
    const url_devices = `${THINGSBOARD_HOST}/api/tenant/deviceInfos`;
    
    try {
      const response = await axios.get(url_devices, {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": `Bearer ${token}`,
        },
        params: { pageSize, page }, 
      });
      
      const deviceList = response.data.data;
      const devicesWithTelemetry: Device[] = await Promise.all(
        deviceList.map(async (device: any) => {
          const telemetryUrl = `${THINGSBOARD_HOST}/api/plugins/telemetry/DEVICE/${device.id.id}/values/timeseries?keys=status`;
          try {
            const telemetryRes = await axios.get(telemetryUrl, {
              headers: {
                "Content-Type": "application/json",
                "X-Authorization": `Bearer ${token}`,
              }
            });
            const data = JSON.parse(telemetryRes.data.status[0]?.value);
            const ts = JSON.parse(telemetryRes.data.status[0]?.ts);

            return {
              id: device.id.id,
              name: device.name,
              type: device.type,
              location: device.label || "unknown",
              status: Date.now() - ts > 300000 ? 'inactive' : 'active',
              doorStatus: !data || !data.door_status || data.door_status === 'close' ? 'close' : 'open',
              camStatus: !data || !data.cam_status || data.cam_status === 'inactive'  ? 'inactive' : 'active',
              rfidStatus: !data || !data.rfid_status || data.rfid_status === 'inactive'  ? 'inactive' : 'active',
              fingerPrintStatus: !data || !data.finger_printer_status || data.finger_printer_status === 'inactive' ? 'inactive' : 'active'
            };
          } catch (error) {
            console.error('Error fetching device telemetry:', error);
            return {
              id: device.id.id,
              name: device.name,
              type: device.type,
              location: 'unknown',
              status:  'unknown',
              camStatus: 'unknown',
              rfidStatus:  'unknown',
              fingerPrintStatus: 'unknown'
            };
          }
        })
      );
      return devicesWithTelemetry;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi lấy danh sách thiết bị");
    }
  },
  
  getDeviceProfiles: async (pageSize: number = 10, page: number = 0) => {
    const token = getToken();
    const url = `${THINGSBOARD_HOST}/api/deviceProfileInfos`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": `Bearer ${token}`,
        },
        params: { pageSize, page }, 
      });

      return response.data.data.map((profile: any) => ({
        id: profile.id.id,
        name: profile.name
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi lấy danh sách device profile");
    }
  },
  
  createDevice: async (deviceData: Omit<Partial<Device>, 'id'>): Promise<Partial<Device>> => {
    const token = getToken();
    const url = `${THINGSBOARD_HOST}/api/device`;

    const param = {
      name: deviceData.name,
      type: deviceData.type,
      label: deviceData.location
    }

    try {
      const response = await axios.post(url, param, {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": `Bearer ${token}`,
        }
      });

      return {
        id: response.data.id.id,
        ...deviceData
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi tạo thiết bị");
    }
  },
  
  updateDevice: async (id: string, deviceData: Partial<Device>): Promise<void> => {
    const token = getToken();
    const url_credential = `${THINGSBOARD_HOST}/api/device/${id}/credentials`;

    try {
      const response_access_token = await axios.get(url_credential, {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": `Bearer ${token}`,
        },
      });

      let access_token = response_access_token.data.credentialsId;
      const url_update = `${THINGSBOARD_HOST}/api/device?accessToken=${access_token}`;

      let data = {
        id: {
          id: id,
          entityType: "DEVICE"
        },
        name: deviceData.name,
        type: deviceData.type,
        label: deviceData.location || "Unknown",
        status: "Active",  

      }

      await axios.post(url_update, data, {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": `Bearer ${token}`,
        },
        
      });

    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi cập nhật thiết bị");
    }
  },
  
  deleteDevice: async (id: string): Promise<void> => {
    const token = getToken();
    const url = `${THINGSBOARD_HOST}/api/device/${id}`;

    try {
      await axios.delete(url, {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": `Bearer ${token}`,
        }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi xóa thiết bị");
    }
  },

  uploadDevices: async (formData: FormData): Promise<void> => {
    const token = getToken();
    const url = `${THINGSBOARD_HOST}/api/device/upload`;

    try {
      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Authorization": `Bearer ${token}`,
        }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi tải lên danh sách thiết bị");
    }
  },
};

// Permission service
export const permissionService = {
  getPermissions: async (): Promise<Permission[]> => {
    const url_users = `${BE_HOST}/api/Permission/All`; // API lấy danh sách người dùng
    
    try {
      const response = await axios.get(url_users, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data.map((permissionInfo: any) => ({
        id: permissionInfo.id,
        userId: permissionInfo.userId,
        deviceId: permissionInfo.deviceId,
        startTime: permissionInfo.time_Start,
        endTime: permissionInfo.time_End,
        createdAt: permissionInfo.createdAt
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi lấy danh sách quyền");
    }
  },
  
  createPermission: async (userIds: string[], deviceIds: string[], startTime: string, endTime: string): Promise<void> => {
    const token = getToken();
    const url = `${BE_HOST}/api/Permission`;

    const param = {
      userIds: userIds,
      deviceIds: deviceIds,
      time_Start: startTime,
      time_End: endTime,
      token: token
      
    }

    try {
      await axios.post(url, param, {
        headers: {
          "Content-Type": "application/json",
        }
      });

    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi tạo phân quyền");
    }
  
  },

  uploadPermissions: async (formData: FormData): Promise<void> => {
    await delay(300);
    // TODO: Implement actual API call
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   throw new Error("Chưa đăng nhập hoặc token không tồn tại");
    // }
    // const url = `${THINGSBOARD_HOST}/api/permissions/upload`;
    // try {
    //   await axios.post(url, formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //       "X-Authorization": `Bearer ${token}`,
    //     },
    //   });
    // } catch (error: any) {
    //   throw new Error(error.response?.data?.message || "Lỗi không xác định khi upload file");
    // }
  },

  deletePermission: async (id: string): Promise<void> => {
  
    const url = `${BE_HOST}/api/Permission/permissionId`; // URL API xóa quyền
  
    try {
      await axios.delete(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi không xác định khi xóa quyền");
    }
  },
}; 

export const historyService = {
  getHistories: async(deviceIds: string[]): Promise<HistoryEntry[]> => {

    const token = getToken();
    const startTs = 0;
    const endTs = Date.now();
    const allHistoriesNested = await Promise.all(
      deviceIds.map(async (deviceId: any) => {

        const telemetryUrl = `${THINGSBOARD_HOST}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`

        try {
          const telemetryRes = await axios.get(telemetryUrl, {
            headers: {
              "Content-Type": "application/json",
              "X-Authorization": `Bearer ${token}`,
            },
            params: {
              keys: "entry_exit_history",
              startTs,
              endTs,
            },
          });

          const entries = telemetryRes.data.entry_exit_history || [];

          const parsedEntries: HistoryEntry[] = entries.map((entry: any) => {
            const data = JSON.parse(entry.value);
            return {
              id: data.id,
              userId: data.user_id,
              deviceId: deviceId,
              timestamp: data.timestamp,
            };
          });

          return parsedEntries;
        } catch (error) {
          console.warn(`Không lấy được lịch sử cho user`, error);
          return [];
        }
      })
    )
    const allHistories: HistoryEntry[] = allHistoriesNested.flat();

    return allHistories;
  },
};


