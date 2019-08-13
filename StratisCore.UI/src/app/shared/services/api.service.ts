import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { interval, Observable } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { GlobalService } from './global.service';
import { ModalService } from './modal.service';
import { AddressLabel } from '../models/address-label';
import { WalletCreation } from '../models/wallet-creation';
import { WalletRecovery } from '../models/wallet-recovery';
import { WalletLoad } from '../models/wallet-load';
import { WalletInfo, WalletInfoRequest } from '../models/wallet-info';
import { SidechainFeeEstimation } from '../models/sidechain-fee-estimation';
import { FeeEstimation } from '../models/fee-estimation';
import { TransactionBuilding } from '../models/transaction-building';
import { TransactionSending } from '../models/transaction-sending';
import { NodeStatus } from '../models/node-status';
import { WalletRescan } from '../models/wallet-rescan';
import { LocalExecutionResult } from '@shared/models/local-execution-result';
import { TokenBalanceRequest } from 'src/app/wallet/tokens/models/token-balance-request';
import { RestApi } from "@shared/services/rest-api";
import { IApiService } from "@shared/services/interfaces/services.i";
import { Balances, GeneralInfo, StakingInfo, WalletFileData, WalletHistory } from "@shared/services/interfaces/api.i";

@Injectable({
  providedIn: "root"
})
export class ApiService extends RestApi implements IApiService {
  private pollingInterval = interval(5000);

  constructor(http: HttpClient, private globalService: GlobalService, modalService: ModalService, router: Router) {
    super(globalService, http, modalService, router);
  };

  public getNodeStatus(silent?: boolean): Observable<NodeStatus> {
    return this.get<NodeStatus>('node/status').pipe(
      catchError(err => this.handleHttpError(err, silent))
    );
  }

  public getNodeStatusInterval(silent?: boolean): Observable<NodeStatus> {
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get<NodeStatus>('node/status')),
      catchError(err => this.handleHttpError(err, silent))
    )
  }

  public getAddressBookAddresses(): Observable<any> {
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get('addressBook')),
      catchError(err => this.handleHttpError(err))
    )
  }

  public addAddressBookAddress(data: AddressLabel): Observable<any> {
    return this.post('addressBook/address', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public removeAddressBookAddress(label: string): Observable<any> {
    let params = new HttpParams().set('label', label);
    return this.delete('addressBook/address', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Gets available wallets at the default path
   */
  public getWalletFiles(): Observable<WalletFileData> {
    return this.get<WalletFileData>('wallet/files').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /** Gets the extended public key from a certain wallet */
  public getExtPubkey(data: WalletInfo): Observable<any> {
    return this.get('wallet/extpubkey', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get a new mnemonic
   */
  public getNewMnemonic(): Observable<any> {
    let params = new HttpParams()
      .set('language', 'English')
      .set('wordCount', '12');

    return this.get('wallet/mnemonic', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Create a new Stratis wallet.
   */
  public createStratisWallet(data: WalletCreation): Observable<any> {
    return this.post('wallet/create/', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Recover a Stratis wallet.
   */
  public recoverStratisWallet(data: WalletRecovery): Observable<any> {
    return this.post('wallet/recover/', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Load a Stratis wallet
   */
  public loadStratisWallet(data: WalletLoad): Observable<any> {
    return this.post('wallet/load/', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get wallet status info from the API.
   */
  public getWalletStatus(): Observable<any> {
    return this.get('wallet/status').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get general wallet info from the API once.
   */
  public getGeneralInfoOnce(data: WalletInfo): Observable<any> {
    let params = new HttpParams().set('Name', data.walletName);
    return this.get('wallet/general-info', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get general wallet info from the API.
   */
  public getGeneralInfo(data: WalletInfo): Observable<GeneralInfo> {
    let params = new HttpParams().set('Name', data.walletName);
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get<GeneralInfo>('wallet/general-info', params)),
      catchError(err => this.handleHttpError(err))
    )
  }

  /**
   * Get wallet balance info from the API.
   */
  public getWalletBalancePolling(data: WalletInfo): Observable<Balances> {
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get<Balances>('wallet/balance', this.getWalletParams(data))),
      catchError(err => this.handleHttpError(err))
    )
  }

  public getWalletBalance(data: WalletInfo): Observable<Balances> {
    return this.get<Balances>('wallet/balance', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    )
  }

  /**
   * Get the maximum sendable amount for a given fee from the API
   */
  public getMaximumBalance(data: WalletInfoRequest): Observable<any> {
    return this.get('wallet/maxbalance',
      this.getWalletParams(data, {
        feeType: data.feeType,
        allowUnconfirmed: "true"
      })).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get a wallets transaction history info from the API.
   */
  public getWalletHistoryPolling(data: WalletInfo): Observable<WalletHistory> {
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get<WalletHistory>('wallet/history', this.getWalletParams(data))),
      catchError(err => this.handleHttpError(err))
    )
  }

  public getWalletHistory(data: WalletInfo): Observable<WalletHistory> {
    return this.get<WalletHistory>('wallet/history', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err)))
  }

  /**
   * Get an unused receive address for a certain wallet from the API.
   */
  public getUnusedReceiveAddress(data: WalletInfo): Observable<any> {
    return this.get('wallet/unusedaddress', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get multiple unused receive addresses for a certain wallet from the API.
   */
  public getUnusedReceiveAddresses(data: WalletInfo, count: string): Observable<any> {
    return this.get('wallet/unusedaddresses', this.getWalletParams(data, {count})).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get get all addresses for an account of a wallet from the API.
   */
  public getAllAddresses(data: WalletInfo): Observable<any> {
    return this.get('wallet/addresses', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Estimate the fee of a transaction
   */
  public estimateFee(data: FeeEstimation): Observable<any> {
    return this.post('wallet/estimate-txfee', {
      'walletName': data.walletName,
      'accountName': data.accountName,
      'recipients': [
        {
          'destinationAddress': data.recipients[0].destinationAddress,
          'amount': data.recipients[0].amount
        }
      ],
      'feeType': data.feeType,
      'allowUnconfirmed': true
    }).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Estimate the fee of a sidechain transaction
   */
  public estimateSidechainFee(data: SidechainFeeEstimation): Observable<any> {
    return this.post('wallet/estimate-txfee', {
      'walletName': data.walletName,
      'accountName': data.accountName,
      'recipients': [
        {
          'destinationAddress': data.recipients[0].destinationAddress,
          'amount': data.recipients[0].amount
        }
      ],
      'feeType': data.feeType,
      'allowUnconfirmed': true
    }).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Build a transaction
   */
  public buildTransaction(data: TransactionBuilding): Observable<any> {
    return this.post('wallet/build-transaction', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Send transaction
   */
  public sendTransaction(data: TransactionSending): Observable<any> {
    return this.post('wallet/send-transaction', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /** Remove transaction */
  public removeTransaction(walletName: string): Observable<any> {
    let params = new HttpParams()
      .set('walletName', walletName)
      .set('all', 'true')
      .set('resync', 'true');
    return this.delete('wallet/remove-transactions', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /** Rescan wallet from a certain date using remove-transactions */
  public rescanWallet(data: WalletRescan): Observable<any> {
    let params = new HttpParams()
      .set('walletName', data.name)
      .set('fromDate', data.fromDate.toDateString())
      .set('reSync', 'true');
    return this.delete('wallet/remove-transactions/', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Start staking
   */
  public startStaking(data: any): Observable<any> {
    return this.post('staking/startstaking', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get staking info
   */
  public getStakingInfo(): Observable<StakingInfo> {
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get<StakingInfo>('staking/getstakinginfo')),
      catchError(err => this.handleHttpError(err))
    )
  }

  /**
   * Stop staking
   */
  public stopStaking(): Observable<any> {
    return this.post('staking/stopstaking', 'true').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Send shutdown signal to the daemon
   */
  public shutdownNode(): Observable<any> {
    return this.post('node/shutdown', 'corsProtection:true').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /*
    * Get the active smart contract wallet address.
    */
  public getAccountAddress(walletName: string): Observable<any> {
    let params = new HttpParams().set('walletName', walletName);
    return this.get('smartcontractwallet/account-address', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public getAccountAddresses(walletName: string): any {
    let params = new HttpParams().set('walletName', walletName);
    return this.get('smartcontractwallet/account-addresses', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /*
    * Get the balance of the active smart contract address.
    */
  public getAccountBalance(walletName: string): Observable<any> {
    let params = new HttpParams().set('walletName', walletName);
    return this.get('smartcontractwallet/account-balance', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /*
    * Get the balance of the active smart contract address.
    */
  public getAddressBalance(address: string): Observable<any> {
    let params = new HttpParams().set('address', address);
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get('smartcontractwallet/address-balance', params)),
      catchError(err => this.handleHttpError(err))
    )
  }

  /*
    * Gets the transaction history of the smart contract account.
    */
  public getAccountHistory(walletName: string, address: string): Observable<WalletHistory> {
    let params = new HttpParams()
      .set('walletName', walletName)
      .set('address', address);
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get<WalletHistory>('smartcontractwallet/history', params)),
      catchError(err => this.handleHttpError(err))
    )
  }

  /*
    * Posts a contract creation transaction
    */
  public postCreateTransaction(transaction: any): Observable<any> {
    return this.post('smartcontractwallet/create', transaction).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /*
    * Posts a contract call transaction
    */
  public postCallTransaction(transaction: any): Observable<any> {
    return this.post('smartcontractwallet/call', transaction).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /*
    * Returns the receipt for a particular txhash, or empty JSON.
    */
  public getReceipt(hash: string, silent: boolean = false): any {
    let params = new HttpParams().set('txHash', hash);
    return this.get('smartcontracts/receipt', params).pipe(
      catchError(err => this.handleHttpError(err, silent))
    );
  }

  /*
    Setting the silent flag is not enough because the error format returned by /receipt still causes a modal to be displayed.
  */
  public getReceiptSilent(hash: string): any {
    let params = new HttpParams().set('txHash', hash);
    return this.get('smartcontracts/receipt', params);
  }

  public localCall(localCall: TokenBalanceRequest): Observable<LocalExecutionResult> {
    return this.post<LocalExecutionResult>('smartcontracts/local-call', localCall).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  private getWalletParams(walletInfo: WalletInfo, extra?: { [key: string]: string }): HttpParams {
    const params = new HttpParams()
      .set('walletName', walletInfo.walletName)
      .set('accountName', `account ${walletInfo.account || 0}`);

    if (extra) {
      Object.keys(extra).forEach(key => params.set(key, extra[key]));
    }

    return params;
  }
}
