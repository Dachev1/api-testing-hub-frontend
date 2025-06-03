import React, { useState } from 'react';
import { Button, Input, Checkbox, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { Plus, X, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KeyValuePair, KeyValueTableProps } from '@/types';

/**
 * Extended type for system headers
 */
interface SystemHeader extends KeyValuePair {
  isSystem: boolean;
}

/**
 * Component for displaying and editing key-value pairs with system headers support
 */
export const KeyValueTable: React.FC<KeyValueTableProps> = ({
  data,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  title,
  className,
}) => {
  const [showHiddenHeaders, setShowHiddenHeaders] = useState(false);
  
  // System headers that are typically added automatically
  const systemHeaders: SystemHeader[] = [
    { key: 'Postman-Token', value: '<calculated when request is sent>', enabled: true, isSystem: true },
    { key: 'Host', value: '<calculated when request is sent>', enabled: true, isSystem: true },
    { key: 'User-Agent', value: 'PostmanRuntime/7.44.0', enabled: true, isSystem: true },
    { key: 'Accept', value: '*/*', enabled: true, isSystem: true },
    { key: 'Accept-Encoding', value: 'gzip, deflate, br', enabled: true, isSystem: true },
    { key: 'Connection', value: 'keep-alive', enabled: true, isSystem: true }
  ];

  /**
   * Check if a header is already defined by the user
   */
  const isHeaderDefined = (key: string) => {
    return data.some(item => item.key.toLowerCase() === key.toLowerCase());
  };

  /**
   * Get system headers that aren't already defined
   */
  const getFilteredSystemHeaders = () => {
    return systemHeaders.filter(header => !isHeaderDefined(header.key));
  };

  // Combined headers (user defined + system headers)
  const allHeaders = showHiddenHeaders 
    ? [...data, ...getFilteredSystemHeaders()]
    : data;
  
  /**
   * Add a new empty row to the data
   */
  const addRow = () => {
    onChange([...data, { key: '', value: '', enabled: true }]);
  };

  /**
   * Update a specific field in a row
   */
  const updateRow = (index: number, field: keyof KeyValuePair, value: string | boolean) => {
    // Only update if it's a user-defined row
    if (index < data.length) {
      const newData = [...data];
      newData[index] = { ...newData[index], [field]: value };
      onChange(newData);
    }
  };

  /**
   * Remove a row from the data
   */
  const removeRow = (index: number) => {
    // Only remove if it's a user-defined row
    if (index < data.length) {
      if (data.length > 1) {
        onChange(data.filter((_, i) => i !== index));
      } else {
        // Keep at least one row, but clear it
        onChange([{ key: '', value: '', enabled: true }]);
      }
    }
  };

  /**
   * Toggle the enabled state of a row
   */
  const toggleRow = (index: number) => {
    // Only toggle if it's a user-defined row
    if (index < data.length) {
      updateRow(index, 'enabled', !data[index].enabled);
    }
  };

  /**
   * Add a system header to user-defined headers
   */
  const addSystemHeader = (header: KeyValuePair) => {
    onChange([...data, { key: header.key, value: header.value, enabled: true }]);
  };

  /**
   * Get the CSS class for highlighting header keys
   */
  const getKeyHighlightClass = (key: string, isSystem = false) => {
    const lowerKey = key.toLowerCase();
    
    if (isSystem) {
      return 'text-gray-500 dark:text-gray-400 font-medium italic';
    }
    
    if (['authorization', 'auth', 'token', 'api-key', 'apikey'].includes(lowerKey)) {
      return 'text-amber-600 dark:text-amber-400 font-medium';
    }
    
    if (['content-type', 'accept'].includes(lowerKey)) {
      return 'text-blue-600 dark:text-blue-400 font-medium';
    }
    
    if (['user-agent', 'origin', 'referer'].includes(lowerKey)) {
      return 'text-emerald-600 dark:text-emerald-400 font-medium';
    }
    
    if (lowerKey.startsWith('x-')) {
      return 'text-violet-600 dark:text-violet-400 font-medium';
    }
    
    return key ? 'text-foreground font-medium' : '';
  };

  /**
   * Get the CSS class for highlighting header values
   */
  const getValueHighlightClass = (key: string, value: string, isSystem = false) => {
    if (isSystem) {
      return 'text-gray-500 dark:text-gray-400 font-mono italic';
    }

    const lowerKey = key.toLowerCase();
    
    if (['authorization', 'auth', 'token'].includes(lowerKey) && value.startsWith('Bearer ')) {
      return 'text-amber-600 dark:text-amber-400 font-mono';
    }
    
    if (['content-type', 'accept'].includes(lowerKey)) {
      return 'text-blue-600 dark:text-blue-400 font-mono';
    }
    
    if (value.match(/^[0-9]+$/)) {
      return 'text-rose-600 dark:text-rose-400 font-mono';
    }
    
    if (value.match(/^(true|false)$/i)) {
      return 'text-emerald-600 dark:text-emerald-400 font-mono';
    }
    
    return value ? 'font-mono text-muted-foreground' : '';
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        {title && <h3 className="text-sm font-medium">{title}</h3>}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowHiddenHeaders(!showHiddenHeaders)}
            className="shadow-sm hover:shadow-md transition-all duration-300"
          >
            {showHiddenHeaders ? (
              <>
                <EyeOff className="mr-1 h-3 w-3" />
                Hide System Headers
              </>
            ) : (
              <>
                <Eye className="mr-1 h-3 w-3" />
                Show System Headers
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addRow}
            className="shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Row
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead className="w-12">
                <span className="sr-only">Enabled</span>
              </TableHead>
              <TableHead className="w-[200px] text-xs font-medium">{keyPlaceholder}</TableHead>
              <TableHead className="min-w-[200px] text-xs font-medium">{valuePlaceholder}</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allHeaders.map((row, index) => {
              const isSystemRow = index >= data.length;
              const isEditable = !isSystemRow;
              const isSystemHeader = 'isSystem' in row && row.isSystem === true;
              
              return (
                <TableRow key={index} className={cn(
                  'transition-all duration-300 hover:bg-muted/20',
                  row.enabled === false && 'opacity-50 bg-muted/30',
                  isSystemRow && 'bg-muted/10'
                )}>
                  <TableCell>
                    {isSystemRow ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => addSystemHeader(row)}
                        className="h-6 w-6 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Checkbox
                        checked={row.enabled !== false}
                        onChange={() => toggleRow(index)}
                        className="mx-auto"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="relative group">
                      <div className={cn(
                        "absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        "bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"
                      )} />
                      <Input
                        placeholder={keyPlaceholder}
                        value={row.key}
                        onChange={(e) => updateRow(index, 'key', e.target.value)}
                        className={cn(
                          'border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
                          'focus-visible:bg-primary/5 transition-all rounded-md px-3 py-1 h-8',
                          getKeyHighlightClass(row.key, isSystemHeader)
                        )}
                        disabled={row.enabled === false || !isEditable}
                        readOnly={!isEditable}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative group">
                      <div className={cn(
                        "absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        "bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"
                      )} />
                      <Input
                        placeholder={valuePlaceholder}
                        value={row.value}
                        onChange={(e) => updateRow(index, 'value', e.target.value)}
                        className={cn(
                          'border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
                          'focus-visible:bg-primary/5 transition-all rounded-md px-3 py-1 h-8',
                          getValueHighlightClass(row.key, row.value, isSystemHeader)
                        )}
                        disabled={row.enabled === false || !isEditable}
                        readOnly={!isEditable}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {isEditable ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="w-8 h-8"></div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-muted-foreground mt-2 flex justify-between">
        <span>
          {data.filter(row => row.enabled !== false && row.key.trim()).length} of {data.length} rows enabled
        </span>
        {showHiddenHeaders && (
          <span className="italic">
            System headers are automatically included with your request
          </span>
        )}
      </div>
    </div>
  );
}; 