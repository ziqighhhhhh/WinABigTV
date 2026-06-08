import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { QRCodeSVG } from "qrcode.react";
import { worldCupTeams } from "@/lib/worldcup-teams";
import { surveyQuestions } from "@/lib/survey-questions";
import {
  Search,
  LayoutDashboard,
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Plus,
  Download,
  Eye,
  Clock,
  LogOut,
  FileDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type TabType = "registration" | "customers" | "scanRecords" | "winners";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("registration");

  // 生成二维码状态
  const [genCategory, setGenCategory] = useState("default");
  const [genCustomerId, setGenCustomerId] = useState<string>("");
  const [genMaxScans, setGenMaxScans] = useState(1);

  // 列表状态
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedQrUrl, setSelectedQrUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [detailTarget, setDetailTarget] = useState<number | null>(null);
  const pageSize = 10;

  // 客户管理状态
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerCountry, setNewCustomerCountry] = useState("");
  const [newCustomerContact, setNewCustomerContact] = useState("");

  // 中奖筛选状态
  const [winnerTeams, setWinnerTeams] = useState<string[]>(["", "", "", ""]);
  const [scanSearch, setScanSearch] = useState("");
  const [scanCustomerId, setScanCustomerId] = useState<string>("");
  const [scanPage, setScanPage] = useState(1);

  const utils = trpc.useUtils();

  const { data: qrList, isLoading: listLoading } = trpc.qrCode.list.useQuery({
    page,
    limit: pageSize,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const { data: customersList } = trpc.qrCode.customers.useQuery();

  const generateMutation = trpc.qrCode.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`成功生成 ${data.count} 个二维码`);
      utils.qrCode.list.invalidate();
    },
    onError: (err) => {
      toast.error("生成失败: " + err.message);
    },
  });

  const deleteMutation = trpc.qrCode.delete.useMutation({
    onSuccess: () => {
      toast.success("删除成功");
      utils.qrCode.list.invalidate();
      setDeleteDialogOpen(false);
    },
  });

  const createCustomerMutation = trpc.qrCode.createCustomer.useMutation({
    onSuccess: () => {
      toast.success("客户创建成功");
      setNewCustomerName("");
      setNewCustomerCountry("");
      setNewCustomerContact("");
      utils.qrCode.customers.invalidate();
      utils.qrCode.list.invalidate();
    },
    onError: (err) => {
      toast.error("创建失败: " + err.message);
    },
  });

  const assignCustomerMutation = trpc.qrCode.assignCustomer.useMutation({
    onSuccess: () => {
      toast.success("客户分配已更新");
      utils.qrCode.list.invalidate();
    },
    onError: (err) => {
      toast.error("分配失败: " + err.message);
    },
  });

  const winnersQuery = trpc.qrCode.winners.useQuery(
    {
      team1: winnerTeams[0],
      team2: winnerTeams[1],
      team3: winnerTeams[2],
      team4: winnerTeams[3],
    },
    { enabled: false }
  );

  const { data: detailData, isLoading: detailLoading } = trpc.qrCode.getDetail.useQuery(
    { id: detailTarget! },
    { enabled: detailTarget !== null }
  );

  const { data: scanRecordsData, isLoading: scanRecordsLoading } =
    trpc.qrCode.scanRecords.useQuery({
      page: scanPage,
      limit: pageSize,
      search: scanSearch || undefined,
      customerId: scanCustomerId ? Number(scanCustomerId) : undefined,
    });

  const exportScanRecordsMutation = trpc.qrCode.exportScanRecords.useMutation({
    onSuccess: ({ csv }) => {
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scan_records_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    },
    onError: (err) => {
      toast.error("Export failed: " + err.message);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      count: 1,
      category: genCategory,
      customerId: genCustomerId ? Number(genCustomerId) : undefined,
      maxScans: genMaxScans,
    });
  };

  const handleDelete = (id: number) => {
    setDeleteTarget(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget !== null) {
      deleteMutation.mutate({ id: deleteTarget });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin", { replace: true });
  };

  const handleCreateCustomer = () => {
    if (!newCustomerName.trim()) {
      toast.error("请输入客户名称");
      return;
    }
    createCustomerMutation.mutate({
      name: newCustomerName.trim(),
      country: newCustomerCountry.trim() || undefined,
      contact: newCustomerContact.trim() || undefined,
    });
  };

  const handleSearchWinners = () => {
    if (winnerTeams.some((t) => !t)) {
      toast.error("请选择全部 4 支球队");
      return;
    }
    if (new Set(winnerTeams).size !== 4) {
      toast.error("请选择 4 支不同的球队");
      return;
    }
    winnersQuery.refetch();
  };

  const exportWinnersToCSV = () => {
    if (!winnersQuery.data || winnersQuery.data.length === 0) {
      toast.error("没有中奖数据可导出");
      return;
    }

    const headers = ["编码", "客户", "球队1", "球队2", "球队3", "球队4"];
    const rows = winnersQuery.data.map((w) => [
      w.code,
      w.customerName || "未分配",
      worldCupTeams.find((t) => t.id === w.teams[0])?.name || w.teams[0],
      worldCupTeams.find((t) => t.id === w.teams[1])?.name || w.teams[1],
      worldCupTeams.find((t) => t.id === w.teams[2])?.name || w.teams[2],
      worldCupTeams.find((t) => t.id === w.teams[3])?.name || w.teams[3],
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `winners_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV 导出成功");
  };

  const getCustomerName = (customerId?: number | null) => {
    if (!customerId) return "未分配";
    const customer = customersList?.find((c) => c.id === customerId);
    return customer?.name || `客户 #${customerId}`;
  };

  const totalPages = qrList ? Math.ceil(qrList.total / pageSize) : 0;
  const scanTotalPages = scanRecordsData ? Math.ceil(scanRecordsData.total / pageSize) : 0;

  const navItems = [
    { icon: LayoutDashboard, label: "报名管理", tab: "registration" as TabType },
    { icon: Users, label: "客户管理", tab: "customers" as TabType },
    { icon: Clock, label: "扫码记录", tab: "scanRecords" as TabType },
    { icon: Trophy, label: "中奖筛选", tab: "winners" as TabType },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex">
      <Toaster position="top-right" />

      {/* 左侧导航栏 */}
      <aside className="w-64 bg-white border-r border-[#e5e7eb] flex-shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-[#e5e7eb]">
          <p className="text-sm font-medium text-[#6b7280]">虎头电池管理系统</p>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <div
              key={item.label}
              onClick={() => setActiveTab(item.tab)}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md cursor-pointer transition-colors ${
                activeTab === item.tab
                  ? "bg-[#eff6ff] text-[#111827] font-medium relative"
                  : "text-[#6b7280] hover:bg-[#f9fafb]"
              }`}
            >
              {activeTab === item.tab && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2563eb] rounded-r" />
              )}
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* 右侧主内容 */}
      <main className="flex-1 min-w-0">
        {/* 顶栏 */}
        <header className="bg-white border-b border-[#e5e7eb] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#6b7280]">
            <span>首页</span>
            <ChevronRightIcon size={14} />
            <span className="text-[#111827] font-medium">
              {activeTab === "registration" && "报名管理"}
              {activeTab === "customers" && "客户管理"}
              {activeTab === "scanRecords" && "扫码记录"}
              {activeTab === "winners" && "中奖筛选"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
            退出登录
          </button>
        </header>

        <div className="p-6 space-y-6">
          {/* ===== 报名管理 ===== */}
          {activeTab === "registration" && (
            <>
              {/* 生成配置卡片 */}
              <Card className="border border-[#e5e7eb] shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-[#111827]">
                    批量生成二维码
                  </CardTitle>
                  <CardDescription className="text-sm text-[#6b7280]">
                    生成后将自动跳转至列表页
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#111827]">最大扫码次数</Label>
                      <Input
                        type="number"
                        min={1}
                        value={genMaxScans}
                        onChange={(e) => setGenMaxScans(Number(e.target.value))}
                        className="h-10 border-[#e5e7eb] rounded-md focus:ring-2 focus:ring-blue-100 focus:border-[#2563eb]"
                      />
                      <p className="text-xs text-[#6b7280]">每个二维码可提交的次数</p>
                    </div>
                    <div className="hidden">
                      <Label className="text-sm font-medium text-[#111827]">报名分类</Label>
                      <Select value={genCategory} onValueChange={setGenCategory}>
                        <SelectTrigger className="h-10 border-[#e5e7eb] rounded-md">
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">全部</SelectItem>
                          <SelectItem value="activity">活动报名</SelectItem>
                          <SelectItem value="meeting">会议签到</SelectItem>
                          <SelectItem value="course">课程注册</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-[#6b7280]">选择对应的分类进行生成</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#111827]">分配客户</Label>
                      <Select
                        value={genCustomerId || "none"}
                        onValueChange={(value) =>
                          setGenCustomerId(value === "none" ? "" : value)
                        }
                      >
                        <SelectTrigger className="h-10 border-[#e5e7eb] rounded-md">
                          <SelectValue placeholder="选择客户（可选）" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">不分配</SelectItem>
                          {customersList?.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-[#6b7280]">选择分发该批编码的客户</p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleGenerate}
                      disabled={generateMutation.isPending}
                      className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-6 h-10 text-sm font-medium shadow-sm"
                    >
                      {generateMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <Spinner className="size-4" />
                          生成中...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus size={16} />
                          立即生成
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 二维码列表卡片 */}
              <Card className="border border-[#e5e7eb] shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-[#111827]">
                    二维码列表
                  </CardTitle>
                  <CardDescription className="text-sm text-[#6b7280]">
                    共 {qrList?.total || 0} 条记录
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 过滤器 */}
                  <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-[#e5e7eb]">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-36 h-9 text-sm border-[#e5e7eb]">
                        <SelectValue placeholder="全部分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部分类</SelectItem>
                        <SelectItem value="default">全部</SelectItem>
                        <SelectItem value="activity">活动报名</SelectItem>
                        <SelectItem value="meeting">会议签到</SelectItem>
                        <SelectItem value="course">课程注册</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-36 h-9 text-sm border-[#e5e7eb]">
                        <SelectValue placeholder="全部状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="unbound">未绑定</SelectItem>
                        <SelectItem value="filled">已填写</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex-1" />

                    <div className="flex gap-2">
                      <Input
                        placeholder="搜索编码"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 h-9 text-sm border-[#e5e7eb]"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPage(1);
                          utils.qrCode.list.invalidate();
                        }}
                        className="h-9 border-[#e5e7eb]"
                      >
                        <Search size={14} className="mr-1" />
                        搜索
                      </Button>
                    </div>
                  </div>

                  {/* 表格 */}
                  {listLoading ? (
                    <div className="flex justify-center py-12">
                      <Spinner className="size-8" />
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-[#f9fafb] hover:bg-[#f9fafb]">
                              <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">ID</TableHead>
                              <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">二维码</TableHead>
                              <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">编码</TableHead>
                              <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">分配客户</TableHead>
                              <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">分类</TableHead>
                              <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">绑定状态</TableHead>
                              <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">扫码进度</TableHead>
                              <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">待扫码</TableHead>
                              <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">创建时间</TableHead>
                              <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider text-right">操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {qrList?.items.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={10} className="text-center py-12 text-[#6b7280]">
                                  暂无数据
                                </TableCell>
                              </TableRow>
                            ) : (
                              qrList?.items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-[#f9fafb] transition-colors">
                                  <TableCell className="text-sm text-[#111827]">{item.id}</TableCell>
                                  <TableCell>
                                    <button
                                      onClick={() => setSelectedQrUrl(`${window.location.origin}${item.url}`)}
                                      className="hover:scale-110 transition-transform"
                                    >
                                      <QRCodeSVG value={`${window.location.origin}${item.url}`} size={32} level="L" />
                                    </button>
                                  </TableCell>
                                  <TableCell>
                                    <span className="inline-block px-2 py-0.5 bg-[#eff6ff] text-[#2563eb] text-xs font-mono font-medium rounded tracking-wider">
                                      {item.code}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-sm text-[#111827] min-w-40">
                                    <Select
                                      value={item.customerId ? String(item.customerId) : "none"}
                                      onValueChange={(value) =>
                                        assignCustomerMutation.mutate({
                                          id: item.id,
                                          customerId: value === "none" ? null : Number(value),
                                        })
                                      }
                                      disabled={assignCustomerMutation.isPending}
                                    >
                                      <SelectTrigger className="h-8 border-[#e5e7eb] text-xs">
                                        <SelectValue placeholder={getCustomerName(item.customerId)} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">未分配</SelectItem>
                                        {customersList?.map((customer) => (
                                          <SelectItem key={customer.id} value={String(customer.id)}>
                                            {customer.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell className="text-sm text-[#111827]">
                                    {item.category === "default" ? "全部" : item.category === "activity" ? "活动报名" : item.category === "meeting" ? "会议签到" : item.category === "course" ? "课程注册" : item.category}
                                  </TableCell>
                                  <TableCell>
                                    {item.currentScans === 0 ? (
                                      <Badge variant="outline" className="text-[#6b7280] border-[#d1d5db] bg-[#f9fafb] text-xs font-normal">未绑定</Badge>
                                    ) : item.currentScans < item.maxScans ? (
                                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 text-xs font-normal">部分扫码</Badge>
                                    ) : (
                                      <Badge className="bg-[#ecfdf5] text-[#059669] border-[#a7f3d0] hover:bg-[#d1fae5] text-xs font-normal">已填写</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-[#111827]">
                                    <div className="min-w-28">
                                      <div className="font-medium">
                                        {item.currentScans} / {item.maxScans}
                                      </div>
                                      <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                          className="h-full rounded-full bg-emerald-500"
                                          style={{
                                            width: `${Math.min(100, Math.round((item.currentScans / Math.max(1, item.maxScans)) * 100))}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm text-[#111827]">
                                    {Math.max(0, item.maxScans - item.currentScans)}
                                  </TableCell>
                                  <TableCell className="text-sm text-[#6b7280]">
                                    {item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN") : "—"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-3">
                                      <button
                                        onClick={() => setSelectedQrUrl(`${window.location.origin}${item.url}`)}
                                        className="text-[#2563eb] text-sm hover:underline flex items-center gap-1"
                                      >
                                        <Download size={13} />
                                        二维码
                                      </button>
                                      {item.status === "filled" && (
                                        <button
                                          onClick={() => setDetailTarget(item.id)}
                                          className="text-[#059669] text-sm hover:underline flex items-center gap-1"
                                        >
                                          <Eye size={13} />
                                          查看结果
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-500 text-sm hover:underline"
                                      >
                                        删除
                                      </button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* 分页器 */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[#e5e7eb]">
                          <span className="text-sm text-[#6b7280]">共 {qrList?.total} 条 {pageSize}条/页</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-8 w-8 p-0 border-[#e5e7eb]"
                          >
                            <ChevronLeft size={14} />
                          </Button>
                          <span className="text-sm text-[#111827] font-medium px-2">{page}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="h-8 w-8 p-0 border-[#e5e7eb]"
                          >
                            <ChevronRight size={14} />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "scanRecords" && (
            <Card className="border border-[#e5e7eb] shadow-none">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-[#111827]">
                    扫码记录
                  </CardTitle>
                  <CardDescription className="text-sm text-[#6b7280]">
                    共 {scanRecordsData?.total || 0} 条扫码提交记录
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    exportScanRecordsMutation.mutate({
                      customerId: scanCustomerId ? Number(scanCustomerId) : undefined,
                    })
                  }
                  disabled={exportScanRecordsMutation.isPending}
                  className="border-[#e5e7eb]"
                >
                  <Download size={16} className="mr-2" />
                  导出 CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-3 border-b border-[#e5e7eb] pb-4">
                  <Select
                    value={scanCustomerId || "all"}
                    onValueChange={(value) => {
                      setScanCustomerId(value === "all" ? "" : value);
                      setScanPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-48 text-sm border-[#e5e7eb]">
                      <SelectValue placeholder="筛选客户" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部客户</SelectItem>
                      {customersList?.map((customer) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-1 justify-end gap-2">
                    <Input
                      placeholder="搜索编码、姓名或联系方式"
                      value={scanSearch}
                      onChange={(event) => {
                        setScanSearch(event.target.value);
                        setScanPage(1);
                      }}
                      className="h-9 max-w-sm text-sm border-[#e5e7eb]"
                    />
                  </div>
                </div>

                {scanRecordsLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner className="size-8" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#f9fafb] hover:bg-[#f9fafb]">
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">记录ID</TableHead>
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">编码</TableHead>
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">客户</TableHead>
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">姓名</TableHead>
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">联系方式</TableHead>
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">国家/地区</TableHead>
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">预测球队</TableHead>
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">扫码时间</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scanRecordsData?.items.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="py-12 text-center text-[#6b7280]">
                                暂无扫码记录
                              </TableCell>
                            </TableRow>
                          ) : (
                            scanRecordsData?.items.map((record) => (
                              <TableRow key={record.id} className="hover:bg-[#f9fafb]">
                                <TableCell className="font-mono text-xs text-[#6b7280]">
                                  #{record.id}
                                </TableCell>
                                <TableCell>
                                  <span className="inline-block rounded bg-[#eff6ff] px-2 py-0.5 font-mono text-xs font-medium tracking-wider text-[#2563eb]">
                                    {record.code.toUpperCase()}
                                  </span>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {record.customerName || "未分配"}
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                  {record.name}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {record.contact}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {record.country || "—"}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {record.teams
                                    .filter(Boolean)
                                    .map((teamId) => worldCupTeams.find((team) => team.id === teamId)?.name || teamId)
                                    .join(", ") || "—"}
                                </TableCell>
                                <TableCell className="text-sm text-[#6b7280]">
                                  {record.scannedAt
                                    ? new Date(record.scannedAt).toLocaleString("zh-CN")
                                    : "—"}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {scanTotalPages > 1 && (
                      <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#e5e7eb] pt-4">
                        <span className="text-sm text-[#6b7280]">
                          共 {scanRecordsData?.total} 条
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setScanPage((current) => Math.max(1, current - 1))}
                          disabled={scanPage === 1}
                          className="h-8 w-8 p-0 border-[#e5e7eb]"
                        >
                          <ChevronLeft size={14} />
                        </Button>
                        <span className="px-2 text-sm font-medium text-[#111827]">
                          {scanPage}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setScanPage((current) => Math.min(scanTotalPages, current + 1))}
                          disabled={scanPage === scanTotalPages}
                          className="h-8 w-8 p-0 border-[#e5e7eb]"
                        >
                          <ChevronRight size={14} />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ===== 客户管理 ===== */}
          {activeTab === "customers" && (
            <>
              <Card className="border border-[#e5e7eb] shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-[#111827]">新增客户</CardTitle>
                  <CardDescription className="text-sm text-[#6b7280]">
                    添加负责分发编码的当地客户
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>客户名称</Label>
                      <Input
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        placeholder="输入客户名称"
                        className="h-10 border-[#e5e7eb]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>国家/地区</Label>
                      <Input
                        value={newCustomerCountry}
                        onChange={(e) => setNewCustomerCountry(e.target.value)}
                        placeholder="输入国家/地区（可选）"
                        className="h-10 border-[#e5e7eb]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>联系人</Label>
                      <Input
                        value={newCustomerContact}
                        onChange={(e) => setNewCustomerContact(e.target.value)}
                        placeholder="输入联系人信息"
                        className="h-10 border-[#e5e7eb]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCreateCustomer}
                      disabled={createCustomerMutation.isPending}
                      className="bg-[#2563eb] hover:bg-[#1d4ed8]"
                    >
                      {createCustomerMutation.isPending ? "创建中..." : "创建客户"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#e5e7eb] shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-[#111827]">客户列表</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#f9fafb]">
                        <TableHead className="text-xs font-medium text-[#6b7280] uppercase">ID</TableHead>
                        <TableHead className="text-xs font-medium text-[#6b7280] uppercase">客户名称</TableHead>
                        <TableHead className="text-xs font-medium text-[#6b7280] uppercase">国家/地区</TableHead>
                        <TableHead className="text-xs font-medium text-[#6b7280] uppercase">联系人</TableHead>
                        <TableHead className="text-xs font-medium text-[#6b7280] uppercase">创建时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customersList?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-[#6b7280]">
                            暂无客户
                          </TableCell>
                        </TableRow>
                      ) : (
                        customersList?.map((c) => (
                          <TableRow key={c.id} className="hover:bg-[#f9fafb]">
                            <TableCell className="text-sm">{c.id}</TableCell>
                            <TableCell className="text-sm font-medium">{c.name}</TableCell>
                            <TableCell className="text-sm">
                              {c.country === "morocco" ? "摩洛哥" : c.country === "nigeria" ? "尼日利亚" : c.country === "iraq" ? "伊拉克" : c.country === "algeria" ? "阿尔及利亚" : c.country || "—"}
                            </TableCell>
                            <TableCell className="text-sm">{c.contact || "—"}</TableCell>
                            <TableCell className="text-sm text-[#6b7280]">
                              {c.createdAt ? new Date(c.createdAt).toLocaleString("zh-CN") : "—"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* ===== 中奖筛选 ===== */}
          {activeTab === "winners" && (
            <>
              <Card className="border border-[#e5e7eb] shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-[#111827]">筛选中奖者</CardTitle>
                  <CardDescription className="text-sm text-[#6b7280]">
                    选择实际进入世界杯前四强的球队，系统将自动匹配预测正确的用户
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index}>
                        <Label className="text-sm font-medium mb-2 block">球队 {index + 1}</Label>
                        <Select
                          value={winnerTeams[index]}
                          onValueChange={(value) => {
                            const newTeams = [...winnerTeams];
                            newTeams[index] = value;
                            setWinnerTeams(newTeams);
                          }}
                        >
                          <SelectTrigger className="h-10 border-[#e5e7eb]">
                            <SelectValue placeholder="选择球队" />
                          </SelectTrigger>
                          <SelectContent>
                            {worldCupTeams.map((team) => (
                              <SelectItem
                                key={team.id}
                                value={team.id}
                                disabled={winnerTeams.includes(team.id) && winnerTeams[index] !== team.id}
                              >
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setWinnerTeams(["", "", "", ""])}
                      className="border-[#e5e7eb]"
                    >
                      重置
                    </Button>
                    <Button
                      onClick={handleSearchWinners}
                      disabled={winnersQuery.isFetching}
                      className="bg-[#2563eb] hover:bg-[#1d4ed8]"
                    >
                      {winnersQuery.isFetching ? "筛选中..." : "筛选中奖者"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {winnersQuery.data && (
                <Card className="border border-[#e5e7eb] shadow-none">
                  <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-[#111827]">
                        中奖名单
                      </CardTitle>
                      <CardDescription className="text-sm text-[#6b7280]">
                        共 {winnersQuery.data.length} 位中奖者
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={exportWinnersToCSV}
                      className="border-[#e5e7eb]"
                    >
                      <FileDown size={16} className="mr-2" />
                      导出 CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {winnersQuery.data.length === 0 ? (
                      <div className="text-center py-12 text-[#6b7280]">
                        <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>没有匹配的中奖者</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#f9fafb]">
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">编码</TableHead>
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">客户</TableHead>
                            <TableHead className="text-xs font-medium text-[#6b7280] uppercase">预测球队</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {winnersQuery.data.map((winner, idx) => (
                            <TableRow key={idx} className="hover:bg-[#f9fafb]">
                              <TableCell>
                                <span className="inline-block px-2 py-0.5 bg-[#eff6ff] text-[#2563eb] text-xs font-mono font-medium rounded tracking-wider">
                                  {winner.code.toUpperCase()}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">{winner.customerName || "未分配"}</TableCell>
                              <TableCell className="text-sm">
                                {winner.teams.map((teamId) => worldCupTeams.find((t) => t.id === teamId)?.name || teamId).join(", ")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      {/* 二维码查看弹窗 */}
      <Dialog open={!!selectedQrUrl} onOpenChange={() => setSelectedQrUrl(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">二维码预览</DialogTitle>
            <DialogDescription className="text-sm text-[#6b7280]">
              扫码即可进入登记页面
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {selectedQrUrl && (
              <>
                <div className="p-4 bg-white border border-[#e5e7eb] rounded-lg">
                  <QRCodeSVG value={selectedQrUrl} size={200} level="M" />
                </div>
                <p className="mt-3 text-xs text-[#6b7280] font-mono break-all max-w-full px-2">
                  {selectedQrUrl}
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">确认删除</DialogTitle>
            <DialogDescription className="text-sm text-[#6b7280]">
              删除后无法恢复，是否继续？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-[#e5e7eb]">
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看填写结果弹窗 */}
      <Dialog open={detailTarget !== null} onOpenChange={() => setDetailTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Users size={18} className="text-[#059669]" />
              填写结果详情
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6b7280]">
              {detailData ? `编码 ${detailData.code.toUpperCase()}` : "加载中..."}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-8" />
            </div>
          ) : detailData?.names ? (
            <div className="space-y-4 py-2">
              <div className="space-y-3">
                {detailData.names.surveyAnswers && (
                  <div className="px-4 py-3 bg-[#f9fafb] rounded-md border border-[#e5e7eb]">
                    <p className="text-sm font-medium text-[#111827] mb-2">调研答案</p>
                    <div className="space-y-1">
                      {(() => {
                        try {
                          const answers = JSON.parse(detailData.names.surveyAnswers as string);
                          return surveyQuestions.map((q, idx) => (
                            <p key={q.id} className="text-xs text-[#6b7280]">
                              {idx + 1}. {q.question.en} → {" "}
                              <span className="text-[#111827] font-medium">
                                {q.options?.find((o) => o.value === answers[idx])?.label.en || answers[idx]}
                              </span>
                            </p>
                          ));
                        } catch {
                          return <p className="text-xs text-[#6b7280]">无法解析</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {detailData.names.team1 && (
                  <div className="px-4 py-3 bg-[#f9fafb] rounded-md border border-[#e5e7eb]">
                    <p className="text-sm font-medium text-[#111827] mb-2">预测球队</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[detailData.names.team1, detailData.names.team2, detailData.names.team3, detailData.names.team4]
                        .filter(Boolean)
                        .map((teamId, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            {worldCupTeams.find((t) => t.id === teamId)?.name || teamId}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-[#e5e7eb]" />

              <div className="flex items-center gap-2 px-1 text-xs text-[#6b7280]">
                <Clock size={13} />
                <span>
                  最后修改时间：
                  {detailData.names.lastModified
                    ? new Date(detailData.names.lastModified).toLocaleString("zh-CN")
                    : "—"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#6b7280] text-sm">
              暂无填写记录
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDetailTarget(null)} className="border-[#e5e7eb]">
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
