import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { AssigneeSelector } from '@/components/assignee-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical, FileText, CheckSquare, Calendar as CalendarIcon, Type, Clock, PenTool, FlaskConical, ChevronDown, Star, CheckCircle2, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

import { useTranslations } from 'next-intl';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';

interface SchemaField {
  key: string;
  type: 'text' | 'long-text' | 'number' | 'rating' | 'boolean' | 'date' | 'time' | 'datetime' | 'file' | 'multi-choice' | 'checkboxes' | 'signature';
  label: string;
  description?: string;
  required: boolean;
  options?: string[]; // For multi-choice
  allowMultiple?: boolean; // For multi-choice (checkboxes mode)
}

interface HumanTaskConfigProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function HumanTaskConfig({ data, onUpdate }: HumanTaskConfigProps) {
  const currentConfig = data || {};
  const schema = (currentConfig.schema || []) as SchemaField[];
  const t = useTranslations("ConfigDrawer.humanTask");
  const params = useParams();
  const [showTestData, setShowTestData] = useState(
    Object.keys(currentConfig.mockResponse || {}).length > 0
  );

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
          <p className="text-11px text-muted-foreground">{t("actionTitleHelp")}</p>
        </div>

        <div className="space-y-2">
            <Label>{t("information")}</Label>
            <Textarea
              value={currentConfig.information || ''}
              onChange={(e) => onUpdate({ ...currentConfig, information: e.target.value })}
              placeholder={t("informationPlaceholder")}
              className="resize-none h-20 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">{t("informationHelp")}</p>
        </div>



        <div className="space-y-2">
           <Label>{t("instructions")}</Label>
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
               <RichTextEditor
                value={currentConfig.instructions || ''}
                onChange={(val) => {
                  onUpdate({ ...currentConfig, instructions: val });
                }}
                placeholder={t("instructionsPlaceholder")}
                className="min-h-[600px]"
              />
              <p className="text-[11px] text-muted-foreground mt-2">{t("instructionsHelp")}</p>
            </div>
        </div>

        <div className="space-y-2">
           <Label>{t("assignee")}</Label>
           <AssigneeSelector
                selected={currentConfig.assignments || []}
                onSelect={(newAssignees) => onUpdate({ ...currentConfig, assignments: newAssignees })}
                orgSlug={params?.slug as string}
            />
            <p className="text-11px text-muted-foreground">Select users or teams responsible for this task.</p>
        </div>
      </div>

      <hr className="my-6 border-muted" />

      {/* Required Information (Schema) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("requiredInfo")}</h3>
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
                          updateField(index, { label: e.target.value });
                        }}
                        placeholder={t("fieldLabelPlaceholder")}
                        className="h-8 text-sm font-medium border-transparent bg-transparent hover:bg-background hover:border-input focus:bg-background focus:border-input px-2 -ml-2 transition-all" 
                      />
                    </div>
                    <Select 
                      value={field.type === 'datetime' ? 'date' : field.type} 
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

                        
                        <SelectItem value="rating"><div className="flex items-center gap-2"><span className="font-mono text-[10px]">★</span> {t("fieldTypes.rating")}</div></SelectItem>
                        <SelectItem value="boolean"><div className="flex items-center gap-2"><CheckSquare className="w-3 h-3"/> {t("fieldTypes.yesNo")}</div></SelectItem>
                        
                        <SelectItem value="date"><div className="flex items-center gap-2"><Calendar className="w-3 h-3"/> {t("fieldTypes.date")}</div></SelectItem>


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

                  {/* Multi-Choice Options (Allow Multiple Toggle) */}
                  {field.type === 'multi-choice' && (
                      <div className="pl-4 border-l-2 border-muted-foreground/20 space-y-2">
                          <div className="flex items-center gap-2">
                              <Switch 
                                  checked={field.allowMultiple || false} 
                                  onCheckedChange={(checked) => updateField(index, { allowMultiple: checked })}
                                  className="scale-75 origin-left"
                              />
                              <Label className="text-xs text-muted-foreground font-normal">{t("fieldTypes.allowMultiple")}</Label>
                          </div>
                      </div>
                  )}

                  {/* Options Editor for Multi-Choice */}
                  {field.type === 'multi-choice' && (
                      <div className="pl-4 border-l-2 border-muted-foreground/20 space-y-2">
                          <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                            {field.allowMultiple ? t("optionsSelectMany") : t("optionsSelectOne")}
                          </Label>
                          <div className="grid grid-cols-1 gap-2">
                              {(field.options || []).map((option, optIndex) => (
                                  <div key={optIndex} className="flex gap-2 items-center">
                                      {field.allowMultiple ? (
                                        <div className="w-3 h-3 mt-0.5 rounded border border-muted-foreground/30 shrink-0" />
                                      ) : (
                                        <div className="w-3 h-3 mt-0.5 rounded-full border border-muted-foreground/30 shrink-0" />
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
                  
                  {/* Date Options (Include Time Toggle) */}
                  {(field.type === 'date' || field.type === 'datetime') && (
                      <div className="pl-4 border-l-2 border-muted-foreground/20 space-y-2">
                          <div className="flex items-center gap-2">
                              <Switch 
                                  checked={field.type === 'datetime'} 
                                  onCheckedChange={(checked) => updateField(index, { type: checked ? 'datetime' : 'date' })}
                                  className="scale-75 origin-left"
                              />
                              <Label className="text-xs text-muted-foreground font-normal">Date Time</Label>
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
        
        <Button
          variant="outline"
          onClick={addField}
          className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary/50"
        >
          <Plus className="w-4 h-4 mr-2" /> {t("addField")}
        </Button>
      </div>

      <hr className="my-6 border-muted" />

      {/* Test Mode: Mock Response Data */}
      <div>
        <button
          onClick={() => setShowTestData(!showTestData)}
          className="flex items-center gap-2 w-full text-left py-1 group"
        >
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showTestData ? '' : '-rotate-90'}`} />
          <FlaskConical className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Test Mode: Mock Response
          </span>
        </button>

        {showTestData && (
          <div className="mt-4 space-y-4 pl-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Provide mock data for each field below. During test runs, this data will be used to
              <strong> auto-complete the human task</strong> instead of waiting for real user input.
            </p>

            {schema.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-border rounded-lg bg-muted/10">
                <p className="text-xs text-muted-foreground">Add form fields above first, then configure mock responses here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schema.map((field, index) => {
                  const mockValue = currentConfig.mockResponse?.[field.key] ?? '';
                  const updateMock = (value: any) => {
                    const newMock = { ...(currentConfig.mockResponse || {}), [field.key]: value };
                    onUpdate({ ...currentConfig, mockResponse: newMock });
                  };

                  return (
                    <div key={field.key || index} className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        {field.label || field.key}
                        <span className="text-muted-foreground font-normal ml-1">({field.type})</span>
                      </Label>
                      {(() => {
                        switch (field.type) {
                          case 'long-text':
                            return (
                              <Textarea
                                value={mockValue}
                                onChange={(e) => updateMock(e.target.value)}
                                placeholder={`Mock value for ${field.key}`}
                                className="resize-none h-16 text-xs"
                              />
                            );
                          case 'boolean':
                            return (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateMock(true)}
                                  className={cn(
                                    "flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                                    mockValue === true
                                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500"
                                      : "border-input bg-background hover:bg-muted/50 text-muted-foreground"
                                  )}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateMock(false)}
                                  className={cn(
                                    "flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                                    mockValue === false
                                      ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 ring-1 ring-red-500"
                                      : "border-input bg-background hover:bg-muted/50 text-muted-foreground"
                                  )}
                                >
                                  <X className="w-3.5 h-3.5" /> No
                                </button>
                              </div>
                            );
                          case 'number':
                            return (
                              <Input
                                type="number"
                                value={mockValue}
                                onChange={(e) => updateMock(e.target.value ? Number(e.target.value) : '')}
                                placeholder={`Mock ${field.key}`}
                                className="h-8 text-xs"
                              />
                            );
                          case 'rating':
                            return (
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => updateMock(star)}
                                    className="p-0.5 rounded-full transition-all hover:bg-muted"
                                  >
                                    <Star className={cn(
                                      "w-5 h-5 transition-all",
                                      (mockValue || 0) >= star
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground/40"
                                    )} />
                                  </button>
                                ))}
                                <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                                  {mockValue ? `${mockValue}/5` : ''}
                                </span>
                              </div>
                            );
                          case 'date':
                          case 'datetime':
                            return (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className={cn(
                                      "w-full flex items-center gap-2 h-8 px-3 rounded-md border border-input bg-background text-xs hover:bg-muted/50 transition-colors text-left",
                                      !mockValue && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                    {mockValue ? format(new Date(mockValue), field.type === 'datetime' ? 'PPP p' : 'PPP') : `Pick a ${field.type === 'datetime' ? 'date & time' : 'date'}...`}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={mockValue ? new Date(mockValue) : undefined}
                                    onSelect={(date) => updateMock(date ? date.toISOString() : '')}
                                  />
                                  {field.type === 'datetime' && (
                                    <div className="p-3 pt-0 border-t">
                                      <Label className="text-[10px] text-muted-foreground">Time</Label>
                                      <Input
                                        type="time"
                                        value={mockValue ? format(new Date(mockValue), 'HH:mm') : ''}
                                        onChange={(e) => {
                                          const base = mockValue ? new Date(mockValue) : new Date();
                                          const [h, m] = e.target.value.split(':');
                                          base.setHours(parseInt(h), parseInt(m));
                                          updateMock(base.toISOString());
                                        }}
                                        className="h-7 text-xs mt-1"
                                      />
                                    </div>
                                  )}
                                </PopoverContent>
                              </Popover>
                            );
                          case 'time':
                            return (
                              <Input
                                type="time"
                                value={mockValue || ''}
                                onChange={(e) => updateMock(e.target.value)}
                                className="h-8 text-xs"
                              />
                            );
                          case 'multi-choice':
                            if (field.allowMultiple) {
                              return (
                                <div className="space-y-1.5 p-2 border rounded-md">
                                  {(field.options || []).map((opt, i) => {
                                    const currentVals = (mockValue as string[]) || [];
                                    const isChecked = Array.isArray(currentVals) && currentVals.includes(opt);
                                    return (
                                      <div key={i} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`mock-${field.key}-${i}`}
                                          checked={isChecked}
                                          onCheckedChange={(checked) => {
                                            let newVals = [...(Array.isArray(currentVals) ? currentVals : [])];
                                            if (checked) newVals.push(opt);
                                            else newVals = newVals.filter(v => v !== opt);
                                            updateMock(newVals);
                                          }}
                                        />
                                        <Label htmlFor={`mock-${field.key}-${i}`} className="text-xs font-normal cursor-pointer">{opt}</Label>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }
                            return (
                              <Select value={String(mockValue)} onValueChange={(val) => updateMock(val)}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select mock option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(field.options || []).map((opt, i) => (
                                    <SelectItem key={i} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          case 'signature':
                            return (
                              <div className="text-center py-3 border border-dashed border-border rounded-lg bg-muted/10">
                                <PenTool className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground">Signature will be auto-filled with a placeholder during test.</p>
                                <input type="hidden" value="mock-signature" onChange={() => updateMock('mock-signature')} />
                              </div>
                            );
                          case 'file':
                            return (
                              <div className="text-center py-3 border border-dashed border-border rounded-lg bg-muted/10">
                                <FileText className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground">File upload will be skipped during test runs.</p>
                              </div>
                            );
                          default:
                            return (
                              <Input
                                value={mockValue}
                                onChange={(e) => updateMock(e.target.value)}
                                placeholder={`Mock value for ${field.key}`}
                                className="h-8 text-xs"
                              />
                            );
                        }
                      })()}
                    </div>
                  );
                })}
              </div>
            )}

            {schema.length > 0 && Object.keys(currentConfig.mockResponse || {}).length > 0 && (
              <div className="p-3 bg-muted/30 rounded-md border border-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Preview: Mock Payload</span>
                <pre className="text-[11px] font-mono bg-background border border-border rounded px-2.5 py-2 text-muted-foreground overflow-x-auto">
                  {JSON.stringify(currentConfig.mockResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
