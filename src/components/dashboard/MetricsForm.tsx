import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMetric } from "@/hooks/useMetrics";
import { toast } from "sonner";
import { format } from "date-fns";

interface MetricsFormProps {
  clientId: string;
}

export default function MetricsForm({ clientId }: MetricsFormProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [periodType, setPeriodType] = useState<string>("");
  const [conversion, setConversion] = useState("");
  const [autonomy, setAutonomy] = useState("");
  const [financialEquiv, setFinancialEquiv] = useState("");
  const [retentionShare, setRetentionShare] = useState("");

  const createMetric = useCreateMetric();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!periodType) {
      toast.error("Выберите период отчета");
      return;
    }

    if (!date) {
      toast.error("Выберите дату");
      return;
    }

    const conversionValue = parseFloat(conversion);
    const autonomyValue = parseFloat(autonomy);
    const financialEquivValue = parseInt(financialEquiv);
    const retentionShareValue = parseFloat(retentionShare);

    if (isNaN(conversionValue) || conversionValue < 0 || conversionValue > 1) {
      toast.error("Конверсия должна быть от 0 до 1");
      return;
    }

    if (isNaN(autonomyValue) || autonomyValue < 0 || autonomyValue > 1) {
      toast.error("Автономность должна быть от 0 до 1");
      return;
    }

    if (isNaN(financialEquivValue) || financialEquivValue < 0) {
      toast.error("Финансовый эквивалент должен быть положительным числом");
      return;
    }

    if (isNaN(retentionShareValue) || retentionShareValue < 0 || retentionShareValue > 1) {
      toast.error("Доля повторных клиентов должна быть от 0 до 1");
      return;
    }

    await createMetric.mutateAsync({
      client_id: clientId,
      date,
      period_type: periodType,
      conversion: conversionValue,
      autonomy: autonomyValue,
      financial_equiv: financialEquivValue,
      retention_share: retentionShareValue,
    });

    // Reset form
    setDate(format(new Date(), "yyyy-MM-dd"));
    setPeriodType("");
    setConversion("");
    setAutonomy("");
    setFinancialEquiv("");
    setRetentionShare("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Дата</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="periodType">Период отчета</Label>
          <Select value={periodType} onValueChange={setPeriodType} required>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Выберите период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">Январь 2025</SelectItem>
              <SelectItem value="2024-12">Декабрь 2024</SelectItem>
              <SelectItem value="2024-11">Ноябрь 2024</SelectItem>
              <SelectItem value="2024-10">Октябрь 2024</SelectItem>
              <SelectItem value="2024-09">Сентябрь 2024</SelectItem>
              <SelectItem value="2024-08">Август 2024</SelectItem>
              <SelectItem value="2024-07">Июль 2024</SelectItem>
              <SelectItem value="2024-06">Июнь 2024</SelectItem>
              <SelectItem value="2024-05">Май 2024</SelectItem>
              <SelectItem value="2024-04">Апрель 2024</SelectItem>
              <SelectItem value="2024-03">Март 2024</SelectItem>
              <SelectItem value="2024-02">Февраль 2024</SelectItem>
              <SelectItem value="2024-01">Январь 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="conversion">Конверсия (0-1)</Label>
          <Input
            id="conversion"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={conversion}
            onChange={(e) => setConversion(e.target.value)}
            placeholder="0.75"
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="autonomy">Автономность (0-1)</Label>
          <Input
            id="autonomy"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={autonomy}
            onChange={(e) => setAutonomy(e.target.value)}
            placeholder="0.85"
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="financialEquiv">Экономия (₽)</Label>
          <Input
            id="financialEquiv"
            type="number"
            min="0"
            value={financialEquiv}
            onChange={(e) => setFinancialEquiv(e.target.value)}
            placeholder="50000"
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="retentionShare">Повторные клиенты (0-1)</Label>
          <Input
            id="retentionShare"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={retentionShare}
            onChange={(e) => setRetentionShare(e.target.value)}
            placeholder="0.45"
            className="mt-2"
            required
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        variant="secondary"
        disabled={createMetric.isPending}
      >
        {createMetric.isPending ? "Сохранение..." : "Добавить метрики"}
      </Button>
    </form>
  );
}
