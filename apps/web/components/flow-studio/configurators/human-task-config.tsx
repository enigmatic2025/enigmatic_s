import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, FileText, CheckSquare, Calendar, Type, Clock, PenTool } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SchemaField {
  key: string;
  type: 'text' | 'long-text' | 'number' | 'rating' | 'boolean' | 'date' | 'time' | 'datetime' | 'file' | 'multi-choice' | 'checkboxes' | 'signature';
  label: string;
  description?: string;
  required: boolean;
  options?: string[]; // For multi-choice and checkboxes
}

interface HumanTaskConfigProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function HumanTaskConfig({ data, onUpdate }: HumanTaskConfigProps) {
  const currentConfig = data || {};
  const schema = (currentConfig.schema || []) as SchemaField[];
  const t = useTranslations("ConfigDrawer.humanTask");

  const addField = () => {
    const newField: SchemaField = {
      key: `field_${schema.length + 1}`,
      type: 'text',
      label: t("newQuestion"),
      required: true
    };
    onUpdate({ ...currentConfig, schema: [...schema, newField] });
  };

  const removeField = (index: number) => {
    const newSchema = [...schema];
    newSchema.splice(index, 1);
    onUpdate({ ...currentConfig, schema: newSchema });
  };

  const updateField = (index: number, updates: Partial<SchemaField>) => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], ...updates };
    onUpdate({ ...currentConfig, schema: newSchema });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t("actionTitle")} <span className="text-red-500">*</span></Label>
          <Input 
            value={currentConfig.title || ''} 
            onChange={(e) => onUpdate({ ...currentConfig, title: e.target.value })}
            placeholder={t("actionTitlePlaceholder")}
          />
          <p className="text-[11px] text-muted-foreground">{t("actionTitleHelp")}</p>
        </div>

        <div className="space-y-2">
          <Label>{t("assignee")} <span className="text-red-500">*</span></Label>
          <Input 
            value={currentConfig.assignee || ''} 
            onChange={(e) => onUpdate({ ...currentConfig, assignee: e.target.value })}
            placeholder={t("assigneePlaceholder")}
          />
        </div>
      </div>

      <hr className="my-6 border-muted" />

      {/* Required Information (Schema) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("requiredInfo")}</h3>
          <Button variant="outline" size="sm" onClick={addField} className="h-7 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> {t("addField")}
          </Button>
        </div>

        <div className="space-y-3">
          {schema.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg text-sm text-muted-foreground">
              {t("noFieldsDefined")}
            </div>
          )}

          {schema.map((field, index) => (
            <div key={index} className="group relative border rounded-lg p-3 space-y-3 bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-2.5 text-muted-foreground/50 cursor-move">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <div className="flex-1 space-y-3">
                  {/* Row 1: Label & Type & Delete */}
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input 
                        value={field.label} 
                        onChange={(e) => {
                          const newLabel = e.target.value;
                          const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                          
                          // Auto-generate key if it matches the previous slug or is default/empty
                          const currentSlug = slugify(field.label);
                          const isAutoKey = field.key === currentSlug || field.key.startsWith('field_') || field.key === '';
                          
                          const updates: Partial<SchemaField> = { label: newLabel };
                          
                          // Only auto-update key if it's not a section header (headers don't use keys heavily)
                          if (isAutoKey) {
                             updates.key = slugify(newLabel);
                          }
                          updateField(index, updates);
                        }}
                        placeholder={t("fieldLabelPlaceholder")}
                        className="h-8 text-sm font-medium border-transparent bg-transparent hover:bg-background hover:border-input focus:bg-background focus:border-input px-2 -ml-2 transition-all" 
                      />
                    </div>
                    <Select 
                      value={field.type} 
                      onValueChange={(val: any) => updateField(index, { type: val })}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text"><div className="flex items-center gap-2"><Type className="w-3 h-3"/> {t("fieldTypes.shortText")}</div></SelectItem>
                        <SelectItem value="long-text"><div className="flex items-center gap-2"><FileText className="w-3 h-3"/> {t("fieldTypes.longText")}</div></SelectItem>
                        <SelectItem value="number"><div className="flex items-center gap-2"><span className="font-mono text-[10px]">123</span> {t("fieldTypes.number")}</div></SelectItem>
                        
                        <SelectItem value="multi-choice"><div className="flex items-center gap-2"><CheckSquare className="w-3 h-3"/> {t("fieldTypes.multiChoice")}</div></SelectItem>
                        <SelectItem value="checkboxes"><div className="flex items-center gap-2"><CheckSquare className="w-3 h-3"/> {t("fieldTypes.checkboxes")}</div></SelectItem>
                        
                        <SelectItem value="rating"><div className="flex items-center gap-2"><span className="font-mono text-[10px]">★</span> {t("fieldTypes.rating")}</div></SelectItem>
                        <SelectItem value="boolean"><div className="flex items-center gap-2"><CheckSquare className="w-3 h-3"/> {t("fieldTypes.yesNo")}</div></SelectItem>
                        
                        <SelectItem value="date"><div className="flex items-center gap-2"><Calendar className="w-3 h-3"/> {t("fieldTypes.dateOnly")}</div></SelectItem>
                        <SelectItem value="time"><div className="flex items-center gap-2"><Clock className="w-3 h-3"/> {t("fieldTypes.timeOnly")}</div></SelectItem>
                        <SelectItem value="datetime"><div className="flex items-center gap-2"><Calendar className="w-3 h-3"/> {t("fieldTypes.dateTime")}</div></SelectItem>

                        <SelectItem value="file"><div className="flex items-center gap-2"><FileText className="w-3 h-3"/> {t("fieldTypes.fileUpload")}</div></SelectItem>
                        <SelectItem value="signature"><div className="flex items-center gap-2"><PenTool className="w-3 h-3"/> {t("fieldTypes.signature")}</div></SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeField(index)}
                      title={t("removeField")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Options Editor for Multi-Choice / Checkboxes */}
                  {(field.type === 'multi-choice' || field.type === 'checkboxes') && (
                      <div className="pl-4 border-l-2 border-muted-foreground/20 space-y-2">
                          <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                            {field.type === 'multi-choice' ? t("optionsSelectOne") : t("optionsSelectMany")}
                          </Label>
                          <div className="grid grid-cols-1 gap-2">
                              {(field.options || []).map((option, optIndex) => (
                                  <div key={optIndex} className="flex gap-2 items-center">
                                      {field.type === 'multi-choice' ? (
                                        <div className="w-3 h-3 mt-0.5 rounded-full border border-muted-foreground/30 shrink-0" />
                                      ) : (
                                        <div className="w-3 h-3 mt-0.5 rounded border border-muted-foreground/30 shrink-0" />
                                      )}
                                      <Input 
                                          value={option}
                                          onChange={(e) => {
                                              const newOptions = [...(field.options || [])];
                                              newOptions[optIndex] = e.target.value;
                                              updateField(index, { options: newOptions });
                                          }}
                                          placeholder={`Option ${optIndex + 1}`}
                                          className="h-7 text-xs"
                                      />
                                      <Button
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                          onClick={() => {
                                              const newOptions = [...(field.options || [])];
                                              newOptions.splice(optIndex, 1);
                                              updateField(index, { options: newOptions });
                                          }}
                                      >
                                          <Trash2 className="w-3 h-3" />
                                      </Button>
                                  </div>
                              ))}
                              <Button
                                  variant="ghost" 
                                  size="sm"
                                  className="justify-start h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 w-fit px-2"
                                  onClick={() => {
                                      const newOptions = [...(field.options || [])];
                                      newOptions.push(`Option ${newOptions.length + 1}`);
                                      updateField(index, { options: newOptions });
                                  }}
                              >
                                  <Plus className="w-3 h-3 mr-1" /> {t("addOption")}
                              </Button>
                          </div>
                      </div>
                  )}

                  {/* Row 2: Key & Required */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 flex-1 bg-background border rounded px-2 py-1 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                      <span className="text-muted-foreground font-mono select-none">key:</span>
                      <input 
                        className="bg-transparent border-none outline-none w-full font-mono text-foreground placeholder:text-muted-foreground/30"
                        value={field.key}
                        onChange={(e) => {
                             // Enforce strict slug format (lower_snake_case)
                             const validKey = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                             updateField(index, { key: validKey });
                        }}
                        placeholder="variable_name"
                      />
                    </div>
                    
                    <div className="flex items-center gap-1.5 pl-2 border-l">
                      <Switch 
                        checked={field.required} 
                        onCheckedChange={(checked) => updateField(index, { required: checked })}
                        className="scale-75"
                      />
                      <span className="text-muted-foreground whitespace-nowrap">{t("required")}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
