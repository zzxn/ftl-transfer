package main

import (
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"crypto/sha256"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

func main() {
	dist := flag.String("dist", "dist", "directory containing release binaries")
	flag.Parse()

	files, err := filepath.Glob(filepath.Join(*dist, "ftl-transfer-*"))
	check(err)
	releaseDir := filepath.Join(*dist, "release")
	check(os.MkdirAll(releaseDir, 0o755))

	var archives []string
	for _, path := range files {
		info, err := os.Stat(path)
		check(err)
		if info.IsDir() {
			continue
		}
		name := filepath.Base(path)
		if strings.HasSuffix(name, ".exe") {
			archive := filepath.Join(releaseDir, strings.TrimSuffix(name, ".exe")+".zip")
			check(writeZIP(archive, path, name))
			archives = append(archives, archive)
			continue
		}
		archive := filepath.Join(releaseDir, name+".tar.gz")
		check(writeTarGz(archive, path, name))
		archives = append(archives, archive)
	}
	if len(archives) == 0 {
		check(fmt.Errorf("no binaries found in %s", *dist))
	}
	sort.Strings(archives)
	check(writeChecksums(filepath.Join(releaseDir, "checksums.txt"), archives))
}

func writeZIP(destination, source, name string) error {
	out, err := os.Create(destination)
	if err != nil {
		return err
	}
	zw := zip.NewWriter(out)
	header := &zip.FileHeader{Name: name, Method: zip.Deflate}
	header.SetMode(0o755)
	entry, err := zw.CreateHeader(header)
	if err == nil {
		err = copyFile(entry, source)
	}
	if closeErr := zw.Close(); err == nil {
		err = closeErr
	}
	if closeErr := out.Close(); err == nil {
		err = closeErr
	}
	return err
}

func writeTarGz(destination, source, name string) error {
	out, err := os.Create(destination)
	if err != nil {
		return err
	}
	gz := gzip.NewWriter(out)
	tw := tar.NewWriter(gz)
	info, err := os.Stat(source)
	if err == nil {
		err = tw.WriteHeader(&tar.Header{Name: name, Mode: 0o755, Size: info.Size()})
	}
	if err == nil {
		err = copyFile(tw, source)
	}
	if closeErr := tw.Close(); err == nil {
		err = closeErr
	}
	if closeErr := gz.Close(); err == nil {
		err = closeErr
	}
	if closeErr := out.Close(); err == nil {
		err = closeErr
	}
	return err
}

func writeChecksums(destination string, archives []string) error {
	out, err := os.Create(destination)
	if err != nil {
		return err
	}
	defer out.Close()
	for _, path := range archives {
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		hash := sha256.New()
		_, copyErr := io.Copy(hash, file)
		closeErr := file.Close()
		if copyErr != nil {
			return copyErr
		}
		if closeErr != nil {
			return closeErr
		}
		if _, err := fmt.Fprintf(out, "%x  %s\n", hash.Sum(nil), filepath.Base(path)); err != nil {
			return err
		}
	}
	return nil
}

func copyFile(destination io.Writer, source string) error {
	file, err := os.Open(source)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = io.Copy(destination, file)
	return err
}

func check(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
