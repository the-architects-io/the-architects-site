"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import { Drive, DriveAccount } from "@/app/blueprint/types";
import { EXECUTION_WALLET_ADDRESS } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import classNames from "classnames";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";

export default function DriveTestPage() {
  const [isFetchingDrive, setIsFetchingDrive] = useState(false);
  const [isFetchingDrives, setIsFetchingDrives] = useState(false);
  const [drives, setDrives] = useState<DriveAccount[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [selectedDriveAddress, setSelectedDriveAddress] = useState<
    string | null
  >(null);
  const [isIncreasingStorage, setIsIncreasingStorage] = useState(false);
  const [isReducingStorage, setIsReducingStorage] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      sizeInKb: 0,
    },
    onSubmit: async (values) => {
      const blueprint = createBlueprintClient({ cluster: "devnet" });
      const { address } = await blueprint.drive.createDrive({
        name: values.name,
        sizeInKb: values.sizeInKb,
        ownerAddress: EXECUTION_WALLET_ADDRESS,
      });
      getDrives();
    },
  });

  const getDrive = useCallback(async () => {
    if (!selectedDriveAddress) return;
    setSelectedDrive(null);
    setIsFetchingDrive(true);
    const blueprint = createBlueprintClient({ cluster: "devnet" });
    const { success, drive } = await blueprint.drive.getDrive({
      address: selectedDriveAddress,
      ownerAddress: EXECUTION_WALLET_ADDRESS,
    });

    if (!success) {
      showToast({ primaryMessage: "Error fetching drive" });
      return;
    }
    setSelectedDrive(drive);
    setIsFetchingDrive(false);
  }, [selectedDriveAddress]);

  const getDrives = async () => {
    setIsFetchingDrives(true);
    const blueprint = createBlueprintClient({ cluster: "devnet" });
    const { success, drives } = await blueprint.drive.getDrives({
      ownerAddress: EXECUTION_WALLET_ADDRESS,
    });

    if (!success) {
      showToast({ primaryMessage: "Error fetching drives" });
      return;
    }
    setDrives(drives);
    setIsFetchingDrives(false);
  };

  const handleSelectDrive = (address: string) => {
    setSelectedDrive(null);
    setSelectedDriveAddress(address);
  };

  const handleIncreaseStorage = async (address: string) => {
    setIsIncreasingStorage(true);
    const blueprint = createBlueprintClient({ cluster: "devnet" });
    const { success } = await blueprint.drive.increaseStorage({
      amountInKb: 100,
      address,
      ownerAddress: EXECUTION_WALLET_ADDRESS,
    });
    if (!success) {
      showToast({ primaryMessage: "Error increasing storage" });
      setIsIncreasingStorage(false);
      return;
    }
    getDrive();
    setIsIncreasingStorage(false);
  };

  const handleReduceStorage = async (address: string) => {
    setIsReducingStorage(true);
    const blueprint = createBlueprintClient({ cluster: "devnet" });
    const { success } = await blueprint.drive.reduceStorage({
      amountInKb: 100,
      address,
      ownerAddress: EXECUTION_WALLET_ADDRESS,
    });
    if (!success) {
      showToast({ primaryMessage: "Error decreasing storage" });
      setIsReducingStorage(false);
      return;
    }
    getDrive();
    setIsReducingStorage(false);
  };

  useEffect(() => {
    if (!drives.length && !isFetchingDrives) {
      getDrives();
    }
    if (selectedDriveAddress && !isFetchingDrive && !selectedDrive) {
      getDrive();
    }
  }, [
    drives,
    getDrive,
    isFetchingDrive,
    isFetchingDrives,
    selectedDrive,
    selectedDriveAddress,
  ]);

  return (
    <ContentWrapper className="flex flex-col justify-center items-center">
      <div className="text-2xl mb-4">drive stuff</div>
      <div className="w-full flex flex-col justify-center items-center py-8">
        <div className="text-xl mb-4">drives</div>
        {isFetchingDrives ? (
          <Spinner />
        ) : (
          <div className="flex flex-col max-w-lg w-full">
            {drives.map((drive, i) => (
              <div
                key={i}
                className="m-2 cursor-pointer"
                onClick={() => handleSelectDrive(drive.address)}
              >
                <div
                  className={classNames([
                    "border p-2 px-4 rounded-lg",
                    selectedDriveAddress === drive.address
                      ? "border-sky-400"
                      : "border-gray-400",
                  ])}
                >
                  {drive.name} - {drive.createdAtString} - {drive.address}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedDriveAddress && (
        <div className="w-full flex flex-col justify-center items-center py-8">
          <div className="text-xl mb-4">drive</div>
          {!!selectedDrive?.address ? (
            <div className="flex flex-col">
              <div className="flex flex-col mb-2">
                <div className="uppercase text-gray-400 text-sm font-bold mr-2">
                  Drive Address
                </div>
                <div>{selectedDrive.address}</div>
              </div>
              <div className="flex flex-col mb-2">
                <div className="uppercase text-gray-400 text-sm font-bold mr-2">
                  Created At
                </div>
                <div>{selectedDrive.account.createdAtString}</div>
              </div>
              <div className="flex flex-col mb-2">
                <div className="uppercase text-gray-400 text-sm font-bold mr-2">
                  Total size
                </div>
                <div>{selectedDrive.storage.total}</div>
              </div>
              <div className="flex flex-col mb-2">
                <div className="uppercase text-gray-400 text-sm font-bold mr-2">
                  Used
                </div>
                <div>{selectedDrive.storage.used}</div>
              </div>
              <div className="flex flex-col mb-2">
                <div className="uppercase text-gray-400 text-sm font-bold mr-2">
                  Remaining
                </div>
                <div className="flex space-x-2">
                  <div>{selectedDrive.storage.free}</div>
                  <div>({selectedDrive.storage.percentFree}%)</div>
                </div>
              </div>
              <div className="flex flex-col mb-2">
                <div className="uppercase text-gray-400 text-sm font-bold mr-2">
                  Files
                </div>
                <div>{selectedDrive.files.length}</div>
              </div>
              <PrimaryButton
                className="border border-gray-400 rounded-lg p-2 px-4"
                onClick={() => handleReduceStorage(selectedDrive.address)}
                disabled={isReducingStorage || isIncreasingStorage}
              >
                {isReducingStorage ? <Spinner /> : "reduce storage"}
              </PrimaryButton>
              <PrimaryButton
                className="border border-gray-400 rounded-lg p-2 px-4"
                onClick={() => handleIncreaseStorage(selectedDrive.address)}
                disabled={isIncreasingStorage || isReducingStorage}
              >
                {isIncreasingStorage ? <Spinner /> : "increase storage"}
              </PrimaryButton>
            </div>
          ) : (
            <Spinner />
          )}
        </div>
      )}
      <FormWrapper onSubmit={formik.handleSubmit}>
        <FormInputWithLabel
          label="name"
          name="name"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.name}
        />
        <FormInputWithLabel
          label="size in kb"
          name="sizeInKb"
          type="number"
          min={1}
          onChange={formik.handleChange}
          value={formik.values.sizeInKb}
        />
        <div className="flex w-full justify-center">
          <SubmitButton
            isSubmitting={formik.isSubmitting}
            onClick={formik.handleSubmit}
          >
            create drive
          </SubmitButton>
        </div>
      </FormWrapper>
    </ContentWrapper>
  );
}
