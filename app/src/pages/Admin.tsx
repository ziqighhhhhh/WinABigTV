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
import {
  Search,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Plus,
  Download,
  Eye,
  Users,
  Clock,
  LogOut,
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

export default function Admin() {
  const navigate = useNavigate();
  const [genCount, setGenCount] = useState(10);
  const [genCategory, setGenCategory] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedQrUrl, setSelectedQrUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [detailTarget, setDetailTarget] = useState<number | null>(null);
  const pageSize = 10;

  const utils = trpc.useUtils();

  const { data: qrList, isLoading: listLoading } = trpc.qrCode.list.useQuery({
    page,
    limit: pageSize,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

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

  const { data: detailData, isLoading: detailLoading } = trpc.qrCode.getDetail.useQuery(
    { id: detailTarget! },
    { enabled: detailTarget !== null }
  );

  const handleGenerate = () => {
    if (genCount < 1 || genCount > 1000) {
      toast.error("生成数量必须在 1-1000 之间");
      return;
    }
    generateMutation.mutate({ count: genCount, category: genCategory });
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
    sessionStorage.removeItem("admin_auth");
    navigate("/admin", { replace: true });
  };

  const totalPages = qrList ? Math.ceil(qrList.total / pageSize) : 0;

  const navItems = [
    { icon: LayoutDashboard, label: "报名管理", active: true },
    { icon: ShoppingCart, label: "订单管理", active: false },
    { icon: Package, label: "商品管理", active: false },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex">
      <Toaster position="top-right" />

      {/* 左侧导航栏 */}
      <aside className="w-64 bg-white border-r border-[#e5e7eb] flex-shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-[#e5e7eb]">
          <p className="text-sm font-medium text-[#6b7280]">系统控制台</p>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md cursor-pointer transition-colors ${
                item.active
                  ? "bg-[#eff6ff] text-[#111827] font-medium relative"
                  : "text-[#6b7280] hover:bg-[#f9fafb]"
              }`}
            >
              {item.active && (
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
            <span className="text-[#111827] font-medium">报名管理</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#111827]">生成数量</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="h-10 border-[#e5e7eb] rounded-md focus:ring-2 focus:ring-blue-100 focus:border-[#2563eb]"
                  />
                  <p className="text-xs text-[#6b7280]">支持一次生成 1-1000 个二维码</p>
                </div>
                <div className="space-y-2">
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
                          <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                            ID
                          </TableHead>
                          <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                            二维码
                          </TableHead>
                          <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                            编码
                          </TableHead>
                          <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                            分类
                          </TableHead>
                          <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                            绑定状态
                          </TableHead>
                          <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                            创建时间
                          </TableHead>
                          <TableHead className="text-xs font-medium text-[#6b7280] uppercase tracking-wider text-right">
                            操作
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {qrList?.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-12 text-[#6b7280]">
                              暂无数据
                            </TableCell>
                          </TableRow>
                        ) : (
                          qrList?.items.map((item) => (
                            <TableRow
                              key={item.id}
                              className="hover:bg-[#f9fafb] transition-colors"
                            >
                              <TableCell className="text-sm text-[#111827]">
                                {item.id}
                              </TableCell>
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
                              <TableCell className="text-sm text-[#111827]">
                                {item.category === "default"
                                  ? "全部"
                                  : item.category === "activity"
                                  ? "活动报名"
                                  : item.category === "meeting"
                                  ? "会议签到"
                                  : item.category === "course"
                                  ? "课程注册"
                                  : item.category}
                              </TableCell>
                              <TableCell>
                                {item.status === "unbound" ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[#6b7280] border-[#d1d5db] bg-[#f9fafb] text-xs font-normal"
                                  >
                                    未绑定
                                  </Badge>
                                ) : (
                                  <Badge className="bg-[#ecfdf5] text-[#059669] border-[#a7f3d0] hover:bg-[#d1fae5] text-xs font-normal">
                                    已填写
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-[#6b7280]">
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleString("zh-CN")
                                  : "—"}
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
                      <span className="text-sm text-[#6b7280]">
                        共 {qrList?.total} 条 {pageSize}条/页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-8 w-8 p-0 border-[#e5e7eb]"
                      >
                        <ChevronLeft size={14} />
                      </Button>
                      <span className="text-sm text-[#111827] font-medium px-2">
                        {page}
                      </span>
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
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-[#e5e7eb]"
            >
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
                {[
                  { label: "第一个名字", value: detailData.names.name1 },
                  { label: "第二个名字", value: detailData.names.name2 },
                  { label: "第三个名字", value: detailData.names.name3 },
                  { label: "第四个名字", value: detailData.names.name4 },
                ].map(({ label, value }, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-3 bg-[#f9fafb] rounded-md border border-[#e5e7eb]"
                  >
                    <span className="text-sm text-[#6b7280]">{label}</span>
                    <span className="text-sm font-medium text-[#111827]">
                      {value || "—"}
                    </span>
                  </div>
                ))}
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
            <Button
              variant="outline"
              onClick={() => setDetailTarget(null)}
              className="border-[#e5e7eb]"
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
