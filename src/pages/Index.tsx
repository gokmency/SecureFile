import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import FileDropZone from '@/components/FileDropZone';
import PasswordInput from '@/components/PasswordInput';
import FileList from '@/components/FileList';
import ActionButton from '@/components/ActionButton';
import OperationLogs from '@/components/OperationLogs';
import Layout from '@/components/Layout';
import InfoDialog from '@/components/InfoDialog';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Unlock, Download, Info, Shield, FileKey, RefreshCw, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  FileWithProgress,
  OperationLog,
  encryptFile,
  decryptFile,
  createDownloadLink,
  createDecryptedFileDownload,
  readFileAsArrayBuffer,
} from '@/utils/cryptoUtils';

const Index = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setPassword('');
    setConfirmPassword('');
    if (files.length > 0) {
      setFiles([]);
      toast({
        title: 'Files cleared',
        description: 'Files have been cleared when switching mode',
      });
    }
  }, [mode, files.length, toast]);

  const addLog = useCallback((log: Omit<OperationLog, 'id' | 'timestamp'>) => {
    setLogs((prev) => [
      {
        id: uuidv4(),
        timestamp: new Date(),
        ...log,
      },
      ...prev,
    ]);
  }, []);

  const handleFilesDrop = useCallback((droppedFiles: File[]) => {
    const newFiles = droppedFiles.map((file) => ({
      id: uuidv4(),
      file,
      progress: 0,
      status: 'idle' as const,
      mode,
    }));

    setFiles((prev) => [...newFiles, ...prev]);
  }, [mode]);

  const updateFileProgress = useCallback((id: string, progress: number) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, progress } : file
      )
    );
  }, []);

  const updateFileStatus = useCallback(
    (
      id: string,
      status: FileWithProgress['status'],
      result?: FileWithProgress['result'],
      error?: string
    ) => {
      setFiles((prev) =>
        prev.map((file) =>
          file.id === id ? { ...file, status, result, error } : file
        )
      );
    },
    []
  );

  const processFile = useCallback(
    async (fileWithProgress: FileWithProgress): Promise<void> => {
      const { id, file, mode } = fileWithProgress;

      updateFileStatus(id, 'processing');

      try {
        if (mode === 'encrypt') {
          const result = await encryptFile(
            file,
            password,
            (progress) => updateFileProgress(id, progress)
          );

          updateFileStatus(id, 'encrypted', result);

          addLog({
            action: 'File encrypted',
            fileName: file.name,
            fileSize: file.size,
            success: true,
          });
        } else {
          const fileData = await readFileAsArrayBuffer(
            file,
            (progress) => updateFileProgress(id, progress)
          );

          const result = await decryptFile(fileData, password, (progress) =>
            updateFileProgress(id, progress)
          );

          updateFileStatus(id, 'decrypted', result);

          addLog({
            action: 'File decrypted',
            fileName: file.name,
            fileSize: file.size,
            success: true,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        updateFileStatus(id, 'error', undefined, errorMessage);
        
        addLog({
          action: mode === 'encrypt' ? 'Encryption failed' : 'Decryption failed',
          fileName: file.name,
          fileSize: file.size,
          success: false,
          error: errorMessage,
        });
      }
    },
    [password, updateFileProgress, updateFileStatus, addLog]
  );

  const processAllFiles = useCallback(async () => {
    if (isProcessing) return;

    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one file to process.',
        variant: 'destructive',
      });
      return;
    }

    if (!password) {
      toast({
        title: 'Password required',
        description: 'Please enter a password to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'encrypt' && password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    const pendingFiles = files.filter((file) => file.status === 'idle');
    if (pendingFiles.length === 0) {
      toast({
        title: 'No pending files',
        description: 'All files have already been processed.',
      });
      return;
    }

    setIsProcessing(true);

    try {
      for (const file of pendingFiles) {
        await processFile(file);
      }

      toast({
        title: `${mode === 'encrypt' ? 'Encryption' : 'Decryption'} complete`,
        description: `Successfully processed ${pendingFiles.length} file(s).`,
      });
    } catch (error) {
      toast({
        title: 'Processing error',
        description: 'An error occurred while processing files.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    files,
    password,
    confirmPassword,
    mode,
    processFile,
    toast,
  ]);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const handleClearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleDownloadFile = useCallback((id: string) => {
    const file = files.find((f) => f.id === id);
    if (!file || !file.result) return;

    let url: string;
    let filename: string;

    if (file.status === 'encrypted' && 'ciphertext' in file.result) {
      const { ciphertext, iv, salt } = file.result;
      const download = createDownloadLink(
        ciphertext,
        salt,
        iv,
        file.file.name
      );
      url = download.url;
      filename = download.filename;
    } else if (file.status === 'decrypted' && 'plaintext' in file.result) {
      const { plaintext, filename: originalFilename } = file.result;
      const download = createDecryptedFileDownload(plaintext, originalFilename);
      url = download.url;
      filename = download.filename;
    } else {
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 100);

    addLog({
      action: `File downloaded (${file.status})`,
      fileName: filename,
      fileSize: file.file.size,
      success: true,
    });
  }, [files, addLog]);

  // Memoize file status counts for better performance
  const fileStatusCounts = useMemo(() => {
    return {
      idle: files.filter(f => f.status === 'idle').length,
      processing: files.filter(f => f.status === 'processing').length,
      completed: files.filter(f => f.status === 'encrypted' || f.status === 'decrypted').length,
      error: files.filter(f => f.status === 'error').length
    };
  }, [files]);
  
  // Memoize download button disabled state
  const isDownloadDisabled = useMemo(() => {
    return isProcessing || !files.some(f => f.status === 'encrypted' || f.status === 'decrypted');
  }, [isProcessing, files]);
  
  // Memoize process button disabled state
  const isProcessButtonDisabled = useMemo(() => {
    if (mode === 'encrypt') {
      return isProcessing || !password || password !== confirmPassword || fileStatusCounts.idle === 0;
    } else {
      return isProcessing || !password || fileStatusCounts.idle === 0;
    }
  }, [isProcessing, password, confirmPassword, mode, fileStatusCounts.idle]);

  return (
    <Layout className="pb-20">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-primary/30 to-primary/10 text-primary-foreground text-xs font-medium mb-2 animate-slide-down shadow-sm border border-primary/20">
            <Shield className="h-3 w-3 inline-block mr-1" /> Secure Client-Side Encryption
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-gradient">
            SecureFile
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encrypt and decrypt your files with AES-256-GCM. All processing happens in your browser.
          </p>
          
          <div className="flex justify-center gap-3 mt-4 pt-2">
            <InfoDialog 
              triggerText="How It Works" 
              title="How SecureFile Works"
              icon={<Info className="h-4 w-4" />}
              variant="outline"
              className="neo-blur border-primary/30 text-primary-foreground"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Client-Side Encryption</h3>
                    <p className="text-sm text-muted-foreground">All encryption and decryption happens in your browser. Your files and passwords never leave your device.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Strong Encryption</h3>
                    <p className="text-sm text-muted-foreground">Files are encrypted using AES-256-GCM, a highly secure encryption algorithm used by governments and financial institutions.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <FileKey className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Password Protection</h3>
                    <p className="text-sm text-muted-foreground">Your password is used to derive a unique encryption key using PBKDF2 with a random salt, making brute-force attacks extremely difficult.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-accent/20">
                    <CheckCircle className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">File Integrity</h3>
                    <p className="text-sm text-muted-foreground">GCM mode provides authentication to verify that the encrypted file hasn't been tampered with.</p>
                  </div>
                </div>
              </div>
            </InfoDialog>
            
            <InfoDialog 
              triggerText="How To Use" 
              title="How to Use SecureFile"
              icon={<HelpCircle className="h-4 w-4" />}
              variant="secondary"
              className="border-secondary/30"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-secondary/20 text-secondary-foreground">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Encrypting Files</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the "Encrypt" tab, drop your files into the upload area, enter a strong password (and confirm it), then click "Encrypt Files". Download the encrypted .enc files.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-secondary/20 text-secondary-foreground">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Decrypting Files</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the "Decrypt" tab, drop your .enc files into the upload area, enter the password that was used to encrypt them, then click "Decrypt Files". Download the decrypted files.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-secondary/20 text-secondary-foreground">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Password Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Use a strong, unique password that you'll remember. There is no way to recover your files if you forget the password used to encrypt them.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-warning/20">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-medium">Important Note</h3>
                    <p className="text-sm text-muted-foreground">
                      Always keep backup copies of your original files. If you forget your password, the encrypted files cannot be recovered.
                    </p>
                  </div>
                </div>
              </div>
            </InfoDialog>
          </div>
        </div>

        <Tabs
          defaultValue="encrypt"
          value={mode}
          onValueChange={(value) => setMode(value as 'encrypt' | 'decrypt')}
          className="space-y-8"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 neo-blur">
            <TabsTrigger value="encrypt" className="flex items-center justify-center gap-2 transition-all duration-300">
              <Lock className="h-4 w-4" />
              Encrypt
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="flex items-center justify-center gap-2 transition-all duration-300">
              <Unlock className="h-4 w-4" />
              Decrypt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encrypt" className="space-y-6 animate-fade-in">
            <div className="space-y-3">
              <FileDropZone
                onFilesDrop={handleFilesDrop}
                disabled={isProcessing}
                mode="encrypt"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  label="Encryption Password"
                  placeholder="Enter a strong password"
                  showStrengthMeter={true}
                  disabled={isProcessing}
                />

                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  showStrengthMeter={false}
                  id="confirm-password"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <ActionButton
                variant="default"
                onClick={processAllFiles}
                disabled={isProcessButtonDisabled}
                loading={isProcessing}
                icon={<Lock className="h-4 w-4" />}
              >
                Encrypt Files
              </ActionButton>

              <ActionButton
                variant="outline"
                onClick={handleClearFiles}
                disabled={isProcessing || files.length === 0}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Clear Files
              </ActionButton>
            </div>
          </TabsContent>

          <TabsContent value="decrypt" className="space-y-6 animate-fade-in">
            <div className="space-y-3">
              <FileDropZone
                onFilesDrop={handleFilesDrop}
                accept=".enc"
                disabled={isProcessing}
                mode="decrypt"
              />

              <PasswordInput
                value={password}
                onChange={setPassword}
                label="Decryption Password"
                placeholder="Enter the password used for encryption"
                showStrengthMeter={false}
                disabled={isProcessing}
              />
            </div>

            <div className="flex justify-center gap-3">
              <ActionButton
                variant="default"
                onClick={processAllFiles}
                disabled={isProcessButtonDisabled}
                loading={isProcessing}
                icon={<Unlock className="h-4 w-4" />}
              >
                Decrypt Files
              </ActionButton>

              <ActionButton
                variant="outline"
                onClick={handleClearFiles}
                disabled={isProcessing || files.length === 0}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Clear Files
              </ActionButton>
            </div>
          </TabsContent>
        </Tabs>

        {files.length > 0 && (
          <div className="mt-8 space-y-2 animate-slide-up">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center">
                <FileKey className="h-4 w-4 mr-1" />
                Files ({files.length})
              </Label>
              <div className="flex items-center gap-2">
                <ActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const downloadableFiles = files.filter(
                      (f) => f.status === 'encrypted' || f.status === 'decrypted'
                    );
                    if (downloadableFiles.length > 0) {
                      downloadableFiles.forEach((f) => handleDownloadFile(f.id));
                    } else {
                      toast({
                        title: 'No files to download',
                        description: 'Process your files before downloading.',
                      });
                    }
                  }}
                  disabled={isDownloadDisabled}
                  icon={<Download className="h-4 w-4" />}
                >
                  Download All
                </ActionButton>
              </div>
            </div>
            <FileList
              files={files}
              onRemoveFile={handleRemoveFile}
              onDownloadFile={handleDownloadFile}
            />
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-border/30 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Operation Logs
            </Label>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Logs are not persisted and will be cleared on refresh</span>
            </div>
          </div>
          <OperationLogs logs={logs} maxHeight="200px" />
        </div>
      </div>
    </Layout>
  );
};

export default React.memo(Index);
