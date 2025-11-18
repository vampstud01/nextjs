"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Download,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";

interface SyncLog {
  id: string;
  status: string;
  message: string | null;
  itemsProcessed: number | null;
  itemsCreated: number | null;
  itemsUpdated: number | null;
  itemsFailed: number | null;
  startedAt: string;
  completedAt: string | null;
}

interface SyncStats {
  totalCampsites: number;
  lastSyncDate: string | null;
  successfulSyncs: number;
  failedSyncs: number;
}

export default function SyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState<SyncStats>({
    totalCampsites: 0,
    lastSyncDate: null,
    successfulSyncs: 0,
    failedSyncs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 로그 및 통계 가져오기
  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch("/api/admin/sync/logs"),
        fetch("/api/admin/sync/stats"),
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setSyncLogs(logsData.logs || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Failed to fetch sync data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 동기화 실행
  const handleSync = async () => {
    if (!confirm("고캠핑 API에서 데이터를 동기화하시겠습니까?")) {
      return;
    }

    setIsSyncing(true);

    try {
      const response = await fetch("/api/admin/sync/gocamping", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "동기화에 실패했습니다.");
      }

      alert(
        `동기화가 완료되었습니다!\n\n` +
          `처리: ${data.itemsProcessed}개\n` +
          `생성: ${data.itemsCreated}개\n` +
          `업데이트: ${data.itemsUpdated}개\n` +
          `실패: ${data.itemsFailed}개`
      );

      // 데이터 새로고침
      fetchData();
    } catch (error: any) {
      console.error("Sync error:", error);
      alert(error.message || "동기화에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            성공
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="mr-1 h-3 w-3" />
            실패
          </Badge>
        );
      case "RUNNING":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Clock className="mr-1 h-3 w-3" />
            진행 중
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("ko-KR");
  };

  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return "-";
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const seconds = Math.floor((endTime - startTime) / 1000);
    return `${seconds}초`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">
            데이터 동기화 관리
          </h2>
          <p className="text-slate-600">
            고캠핑 API에서 캠핑장 데이터를 동기화합니다
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Database className="h-4 w-4" />
                전체 캠핑장
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {stats.totalCampsites}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Clock className="h-4 w-4" />
                마지막 동기화
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-slate-900">
                {stats.lastSyncDate
                  ? formatDate(stats.lastSyncDate)
                  : "없음"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <CheckCircle className="h-4 w-4" />
                성공한 동기화
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.successfulSyncs}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <XCircle className="h-4 w-4" />
                실패한 동기화
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.failedSyncs}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sync Action */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>데이터 동기화</CardTitle>
            <CardDescription>
              고캠핑 API에서 최신 캠핑장 데이터를 가져옵니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="mb-4 rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 font-semibold text-blue-900">
                    동기화 안내
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• 고캠핑 OpenAPI에서 캠핑장 데이터를 가져옵니다</li>
                    <li>• 기존 캠핑장은 업데이트되고, 새 캠핑장은 추가됩니다</li>
                    <li>• 반려견 정책이 자동으로 분류됩니다</li>
                    <li>• 동기화는 몇 분 정도 소요될 수 있습니다</li>
                  </ul>
                </div>

                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      동기화 중...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      동기화 시작
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sync Logs */}
        <Card>
          <CardHeader>
            <CardTitle>동기화 기록</CardTitle>
            <CardDescription>
              최근 동기화 작업의 상세 내역입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-slate-600">
                로딩 중...
              </div>
            ) : syncLogs.length === 0 ? (
              <div className="py-12 text-center">
                <Database className="mx-auto h-16 w-16 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  동기화 기록이 없습니다
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  동기화를 실행하여 기록을 생성하세요
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                        상태
                      </th>
                      <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                        시작 시간
                      </th>
                      <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                        소요 시간
                      </th>
                      <th className="pb-3 text-center text-sm font-semibold text-slate-700">
                        처리
                      </th>
                      <th className="pb-3 text-center text-sm font-semibold text-slate-700">
                        생성
                      </th>
                      <th className="pb-3 text-center text-sm font-semibold text-slate-700">
                        업데이트
                      </th>
                      <th className="pb-3 text-center text-sm font-semibold text-slate-700">
                        실패
                      </th>
                      <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                        메시지
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-4">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="py-4 text-sm text-slate-700">
                          {formatDate(log.startedAt)}
                        </td>
                        <td className="py-4 text-sm text-slate-700">
                          {calculateDuration(log.startedAt, log.completedAt)}
                        </td>
                        <td className="py-4 text-center text-sm text-slate-700">
                          {log.itemsProcessed ?? "-"}
                        </td>
                        <td className="py-4 text-center text-sm font-medium text-green-600">
                          {log.itemsCreated ?? "-"}
                        </td>
                        <td className="py-4 text-center text-sm font-medium text-blue-600">
                          {log.itemsUpdated ?? "-"}
                        </td>
                        <td className="py-4 text-center text-sm font-medium text-red-600">
                          {log.itemsFailed ?? "-"}
                        </td>
                        <td className="py-4 text-sm text-slate-600">
                          {log.message || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

